
pub mod syscalls {
pub const SYSCALL_WRITE: u64 = 1;
pub const SYSCALL_OPEN: u64 = 2;
pub const SYSCALL_OPENAT: u64 = 3;

pub const SYSCALL_ERROR_STATUS_CODE: i64 = -1;

pub const SYSCALL_READ: u64 = 0;
    pub const SYSCALL_CREAT: u64 = 85;
    pub const SYSCALL_MKDIR: u64 = 83;
    pub const SYSCALL_RMDIR: u64 = 84;
    pub const SYSCALL_READLINK: u64 = 89;
    pub const SYSCALL_SYMLINK: u64 = 88;
    pub const SYSCALL_UNLINK: u64 = 87;



}