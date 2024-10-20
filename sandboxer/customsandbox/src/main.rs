#![allow(warnings)]
use nix::sys::ptrace;
use nix::sys::wait::{wait, waitpid, WaitStatus};
use nix::unistd::{execvp, fork, ForkResult, Pid};
use std::borrow::Borrow;
use std::collections::HashMap;
use std::ffi::CString;
use std::os::raw::c_void;
use std::ptr::null;
use libc::{ino64_t, rand, user_regs_struct, EACCES};
use nix::errno::Errno;
use serde::Serialize;
use serde_json::{Value,json};
use serde_json::Value::Array;
use rand::random;

mod utils;
use crate::utils::prepopulate_ruleset;
mod types;
use crate::types::{JsonConfigType, SyscallRuleSet};
mod file_utils;
use crate::file_utils::load_json;
pub mod filter;
use crate::filter::is_syscall_permittedd;

pub mod constants;
use crate::constants::syscalls::{SYSCALL_OPEN, SYSCALL_OPENAT, SYSCALL_WRITE, SYSCALL_ERROR_STATUS_CODE, SYSCALL_READ, SYSCALL_CREAT, SYSCALL_MKDIR, SYSCALL_READLINK, SYSCALL_SYMLINK, SYSCALL_UNLINK};

fn generate_fake_syscall_result(orig_rax: ino64_t) -> i64{ // we make this so that we trick the progrM INTO THINKING THAT the function failed nor,ally but also manipulate it dynamically with custom results, for example we could make  CUSTOM NETWROK RESULT SINCE MOST MALWARE WHEN FAILING NETWORK CONNECTIVITY DESTROYS ITSELF
   match orig_rax {
       _ => -1,
   }
}

fn get_string_arg(target_pid: Pid, addr: usize) -> String {
    let mut buf = Vec::new();

    for i in 0..256 {
        let word = unsafe {
            ptrace::read(target_pid, (addr + i * std::mem::size_of::<usize>()) as *mut c_void)
                .unwrap_or(0) as u64
        };
        let bytes = word.to_ne_bytes();
        for &byte in &bytes {
            if byte == 0 {
                return String::from_utf8_lossy(&buf).to_string();
            }
            buf.push(byte);
        }
    }
    String::from_utf8_lossy(&buf).to_string()
}


fn get_formatted_syscall(regs: &user_regs_struct, target_pid: Pid) -> String  {
    let syscall_number = regs.orig_rax;
    match syscall_number{

        SYSCALL_OPENAT => {
            let dirfd = regs.rdi;
            let pathname_addr = regs.rsi as usize;
            let flags = regs.rdx;
            let mode = regs.r10; // Mode (only valid if O_CREAT is set)

            let pathname = get_string_arg(target_pid, pathname_addr);

            format!("openat({}, \"{}\", {}, {})", dirfd, pathname, flags, mode)
        }

        SYSCALL_WRITE => {
            let fd = regs.rdi;
            let buf_addr = regs.rsi as usize;
            let count = regs.rdx;
            let buf = get_string_arg(target_pid, buf_addr);
            // println!("buff -> {}",buf.to)
            format!("write({}, \"{}\", {})", fd, buf, count)
        }

        SYSCALL_OPEN => {
            let pathname_addr = regs.rdi as usize;
            let pathname = get_string_arg(target_pid, pathname_addr);
            format!("open(\"{}\")", pathname)
        }

        SYSCALL_READ => {
            let fd = regs.rdi;
            let buf_addr = regs.rsi as usize;
            let count = regs.rdx;
            format!("read({}, 0x{:x}, {})", fd, buf_addr, count)
        }

        SYSCALL_CREAT => {
            let pathname_addr = regs.rdi as usize;
            let mode = regs.rsi;
            let pathname = get_string_arg(target_pid, pathname_addr);
            format!("creat(\"{}\", {})", pathname, mode)
        }

        SYSCALL_MKDIR => {
            let pathname_addr = regs.rdi as usize;
            let mode = regs.rsi;
            let pathname = get_string_arg(target_pid, pathname_addr);
            format!("mkdir(\"{}\", {})", pathname, mode)
        }

        SYSCALL_READLINK => {
            let pathname_addr = regs.rdi as usize;
            let buf_addr = regs.rsi as usize;
            let buf_size = regs.rdx;
            let pathname = get_string_arg(target_pid, pathname_addr);
            format!("readlink(\"{}\", 0x{:x}, {})", pathname, buf_addr, buf_size)
        }

        SYSCALL_SYMLINK => {
            let target_addr = regs.rdi as usize;
            let linkpath_addr = regs.rsi as usize;
            let target = get_string_arg(target_pid, target_addr);
            let linkpath = get_string_arg(target_pid, linkpath_addr);
            format!("symlink(\"{}\", \"{}\")", target, linkpath)
        }

        SYSCALL_UNLINK => {
            let pathname_addr = regs.rdi as usize;
            let pathname = get_string_arg(target_pid, pathname_addr);
            format!("unlink(\"{}\")", pathname)
        }

        _ => format!("Unknown syscall: {}", syscall_number),
    }
}

fn string_to_ascii(input: &str) -> Vec<u8> {
    input.bytes().collect()
}

fn string_to_numbers(input: &str) -> Vec<u8> {
    input.bytes().collect()
}

fn print_syscall_args(regs: &user_regs_struct) {
    println!(
        "({}, {}, {}, {}, {}, {})",
        regs.rdi, regs.rsi, regs.rdx, regs.r10, regs.r8, regs.r9
    );
}



fn intercept_syscalls(target_pid: Pid) {
    // let config = prepopulate_ruleset();

    // println!("-");
    // println!("{},\n {}", serde_json::to_string(&config).unwrap().to_string() , serde_json::to_string(&configtwo).unwrap().to_string());
    // println!("{}", "-");

    let config: JsonConfigType = match load_json("src/example.json"){
        Ok(x) => x,
        Err(e) => {eprintln!("{}", e); return;}
    };

    match ptrace::setoptions(target_pid, ptrace::Options::PTRACE_O_TRACESYSGOOD) {
        Ok(_) => {}

        Err(e) => {
            eprintln!("err: {}", e);
        }
    }

    loop {
        match waitpid(target_pid, None) {
            Ok(WaitStatus::Exited(_, _)) | Ok(WaitStatus::Signaled(_, _, _)) => break,
            Ok(_) => {}
            Err(e) => {
                eprintln!("waitpid error: {}", e);
                break;
            }
        }

        // Syscall entry event: before the syscall
        let regs: user_regs_struct = match ptrace::getregs(target_pid) {
            Ok(regs) => regs,
            Err(e) => {
                eprintln!("ptrace::getregs error: {}", e);
                break;
            }
        };

        let formatted_syscall = get_formatted_syscall(&regs, target_pid);
        let res = is_syscall_permittedd(&*formatted_syscall, config.borrow());

        match res {
            true => {
                println!("allowing syscall, {}", formatted_syscall);
            }

            false => {
                println!("Blocking syscall: {} from pid {}", formatted_syscall, target_pid);

                let mut new_regs: user_regs_struct = regs;
                new_regs.orig_rax = u64::MAX; // Set an invalid syscall number to block

                println!("{}", new_regs.orig_rax);
                let _ = ptrace::setregs(target_pid, new_regs);
            }
        }

        // Continue and wait for the next syscall entry
        ptrace::syscall(target_pid, None).unwrap();
    }
}


fn spawn_program_as_child_process(program: &str, args: &[String]) -> Result<(), Box<dyn std::error::Error>> {

    // Prepare the program and arguments as CString
    let program_cstr = CString::new(program)?;
    let args_cstr: Vec<CString> = args
        .iter()
        .map(|arg| CString::new(arg.as_str()).unwrap())
        .collect();

    // Make the child traceable by the parent (ptrace)


    ptrace::traceme().unwrap();

    // Replace the current process image with the new program
    execvp(&program_cstr, &args_cstr).unwrap();

    // If execvp fails, unreachable!() ensures this is never called
    unreachable!();
}

fn main() -> Result<(), Box<dyn std::error::Error>> {

    let args: Vec<String> = std::env::args().collect();
    // TODO: remove commented code after debugging after debungging

    // if args.len() < 2 {
    //     eprintln!("Usage: {} <program> [args...]", args[0]);
    //     return Ok(());
    // }
    // let program_args = &args[2..];

    let program = /*&args[1];*/ "../exe_to_be_intercepted";
    let program_args = &[String::from("")]; // remove after debugging

    match unsafe { fork() } {
        Ok(ForkResult::Child) => {
            // In child process, spawn the target program
            spawn_program_as_child_process(program, program_args)?;
        }

        Ok(ForkResult::Parent { child }) => {
            // In parent process, intercept system calls from the child
            intercept_syscalls(child);
        }

        Err(e) => {
            eprintln!("Fork error: {}", e);
        }
    }

    Ok(())

}