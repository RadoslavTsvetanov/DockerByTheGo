use std::ffi::{CStr, CString};
use std::mem;
use std::os::raw::{c_int, c_long, c_char, c_void};
use std::process::exit;
use std::ptr;
use std::ptr::null_mut;
use std::io::{self, Write};

use libc::pid_t;

#[repr(C)]
struct UserRegsStruct {
    rax: c_long,
    rbx: c_long,
    rcx: c_long,
    rdx: c_long,
    rsi: c_long,
    rdi: c_long,
    orig_rax: c_long,
    rip: c_long,
    cs: c_long,
    eflags: c_long,
    rsp: c_long,
    ss: c_long,
}

fn should_syscall_be_executed(syscall: &str) -> bool {
    // Implement your logic for determining if the syscall should be executed
    true
}

fn get_string_arg(target_pid: pid_t, addr: usize) -> io::Result<String> {
    let mut buf = Vec::new();
    let mut offset = 0;

    loop {
        let word = unsafe { libc::ptrace(libc::PTRACE_PEEKDATA, target_pid, (addr + offset) as *mut c_void, null_mut()) };
        if word == -1 && io::Error::last_os_error().kind() != io::ErrorKind::Other {
            return Err(io::Error::last_os_error());
        }

        let bytes: [u8; 8] = unsafe { mem::transmute(word as u64) };
        if let Some(null_pos) = bytes.iter().position(|&b| b == 0) {
            buf.extend_from_slice(&bytes[..null_pos]);
            break;
        }
        buf.extend_from_slice(&bytes);
        offset += 8;
    }
    Ok(String::from_utf8_lossy(&buf).into_owned())
}

fn intercept_syscalls(target_pid: pid_t) -> io::Result<()> {
    loop {
        let mut status: c_int = 0;
        if unsafe { libc::waitpid(target_pid, &mut status, 0) } == -1 {
            return Err(io::Error::last_os_error());
        }

        if libc::WIFEXITED(status) || libc::WIFSIGNALED(status) {
            break;
        }

        let mut regs: UserRegsStruct = unsafe { mem::zeroed() };
        if unsafe { libc::ptrace(libc::PTRACE_GETREGS, target_pid, null_mut(), &mut regs as *mut _ as *mut c_void) } == -1 {
            return Err(io::Error::last_os_error());
        }

        match regs.orig_rax as i64 {
            1 => { // write syscall number
                let fd = regs.rdi;
                let buf_addr = regs.rsi;
                let count = regs.rdx;

                let buf = get_string_arg(target_pid, buf_addr as usize)?;
                println!("Intercepted write({}, \"{}\", {})", fd, buf, count);

                if !should_syscall_be_executed("write") {
                    println!("Blocking write syscall");
                    regs.orig_rax = -1; // Block the syscall
                    unsafe { libc::ptrace(libc::PTRACE_SETREGS, target_pid, null_mut(), &regs as *const _ as *mut c_void) };
                }
            },
            2 => { // open syscall number
                let pathname_addr = regs.rdi;
                let pathname = get_string_arg(target_pid, pathname_addr as usize)?;
                println!("Intercepted open(\"{}\")", pathname);

                if !should_syscall_be_executed("open") {
                    println!("Blocking open syscall");
                    regs.orig_rax = -1;
                    unsafe { libc::ptrace(libc::PTRACE_SETREGS, target_pid, null_mut(), &regs as *const _ as *mut c_void) };
                }
            },
            _ => {}
        }

        unsafe { libc::ptrace(libc::PTRACE_SYSCALL, target_pid, null_mut(), null_mut()) }; // Allow syscall to proceed (entry)
        unsafe { libc::waitpid(target_pid, &mut status, 0) };
        unsafe { libc::ptrace(libc::PTRACE_SYSCALL, target_pid, null_mut(), null_mut()) }; // Allow syscall to proceed (exit)
    }
    Ok(())
}

fn main() -> io::Result<()> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <program> [args...]", args[0]);
        exit(1);
    }

    let child = unsafe { libc::fork() };
    if child == 0 {
        // Child process
        unsafe { libc::ptrace(libc::PTRACE_TRACEME, 0, null_mut(), null_mut()) };
        let program = CString::new(args[1].clone()).expect("CString::new failed");
        let args_c: Vec<CString> = args.iter().skip(1).map(|arg| CString::new(arg.clone()).unwrap()).collect();
        let mut arg_ptrs: Vec<*const c_char> = args_c.iter().map(|arg| arg.as_ptr()).collect();
        arg_ptrs.push(ptr::null()); // Null-terminate the argument list

        unsafe {
            libc::execvp(program.as_ptr(), arg_ptrs.as_ptr() as *const *const c_char);
            eprintln!("execvp failed");
            exit(1);
        }
    } else if child < 0 {
        return Err(io::Error::last_os_error());
    }

    // Parent process intercepts syscalls
    intercept_syscalls(child)
}