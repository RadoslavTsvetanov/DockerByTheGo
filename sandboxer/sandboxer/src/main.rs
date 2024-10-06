use nix::sys::ptrace;
use nix::sys::signal::Signal;
use nix::sys::wait::{wait, waitpid, WaitStatus};
use nix::unistd::{execvp, fork, ForkResult, Pid};
use std::ffi::CString;
use std::os::raw::c_void;

const SYSCALL_WRITE: u64 = 1;
const SYSCALL_OPEN: u64 = 2;

fn should_syscall_be_executed(_syscall: &str) -> bool {
    true
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

fn intercept_syscalls(target_pid: Pid) {
    loop {
        match waitpid(target_pid, None) {
            Ok(WaitStatus::Exited(_, _)) | Ok(WaitStatus::Signaled(_, _, _)) => break,
            Ok(_) => {}
            Err(e) => {
                eprintln!("waitpid error: {}", e);
                break;
            }
        }

        let regs = match ptrace::getregs(target_pid) {
            Ok(regs) => regs,
            Err(e) => {
                eprintln!("ptrace::getregs error: {}", e);
                break;
            }
        };

        match regs.orig_rax {
            SYSCALL_WRITE => {
                let fd = regs.rdi;
                let buf_addr = regs.rsi as usize;
                let count = regs.rdx;
                let buf = get_string_arg(target_pid, buf_addr);
                println!("Intercepted write({}, \"{}\", {})", fd, buf, count);
                if !should_syscall_be_executed("write") {
                    println!("Blocking write syscall");
                    let mut new_regs = regs;
                    new_regs.orig_rax = u64::MAX; // Invalid syscall number
                    let _ = ptrace::setregs(target_pid, new_regs);
                }
            }
            SYSCALL_OPEN => {
                let pathname_addr = regs.rdi as usize;
                let pathname = get_string_arg(target_pid, pathname_addr);
                println!("Intercepted open(\"{}\")", pathname);
                if !should_syscall_be_executed("open") {
                    println!("Blocking open syscall");
                    let mut new_regs = regs;
                    new_regs.orig_rax = u64::MAX; // Invalid syscall number
                    let _ = ptrace::setregs(target_pid, new_regs);
                }
            }
            _ => {}
        }

        ptrace::syscall(target_pid, None).unwrap();
        wait().unwrap();
        ptrace::syscall(target_pid, None).unwrap();
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <program> [args...]", args[0]);
        return Ok(());
    }

    match unsafe { fork() } {
        Ok(ForkResult::Child) => {
            ptrace::traceme().unwrap();
            let program = CString::new(args[1].clone())?;
            let args: Vec<CString> = args[2..]
                .iter()
                .map(|s| CString::new(s.as_str()).unwrap())
                .collect();
            execvp(&program, &args).unwrap();
            unreachable!();
        }
        Ok(ForkResult::Parent { child }) => {
            intercept_syscalls(child);
        }
        Err(e) => {
            eprintln!("fork error: {}", e);
        }
    }

    Ok(())
}