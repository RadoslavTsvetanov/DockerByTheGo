#include <unistd.h>
#include <sys/syscall.h>
#include <fcntl.h>
#include <stdio.h>

// Define AT_FDCWD if it's not available
#ifndef AT_FDCWD
#define AT_FDCWD -100
#endif

// Directly invoke the write syscall (syscall number 1)
ssize_t write_syscall(int fd, const char *buf, size_t count) {
    return syscall(SYS_write, fd, buf, count);
}

// Directly invoke the open syscall (syscall number 2)
int open_syscall(const char *pathname, int flags, mode_t mode) {
    return syscall(SYS_openat, AT_FDCWD, pathname, flags, mode);
}

// Directly invoke the read syscall (syscall number 0)
ssize_t read_syscall(int fd, char *buf, size_t count) {
    return syscall(SYS_read, fd, buf, count);
}

int main() {
    const char *filename = "../output.txt"; // File in the parent directory
    char buffer[1024]; // Buffer to read file content into
    
    // Open the file in the parent directory with read-only permissions
    int fd = open_syscall(filename, O_RDONLY, 0);
    
    if (fd < 0) {
        perror("open_syscall");
        return 1;
    }
    
    // Read the contents of the file
    ssize_t bytes_read = read_syscall(fd, buffer, sizeof(buffer) - 1);
    
    if (bytes_read < 0) {
        perror("read_syscall");
        close(fd);
        return 1;
    }
    
    // Null-terminate the buffer to safely print it as a string
    buffer[bytes_read] = '\0';
    
    // Print the contents of the file
    printf("File contents:\n%s\n", buffer);
    
    // Close the file descriptor
    close(fd);
    
    return 0;
}

