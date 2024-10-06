#include <unistd.h>
#include <sys/syscall.h>
#include <fcntl.h>
#include <stdio.h>

// Manually define AT_FDCWD if it's not available
#ifndef AT_FDCWD
#define AT_FDCWD -100
#endif

int open_file_syscall(const char *filename, int flags) {
    // Directly invoke the openat system call
    int fd = syscall(SYS_openat, AT_FDCWD, filename, flags);
    return fd;
}

int main() {
    // Attempt to open the file "testfile.txt" with read-only access
    int fd = open_file_syscall("testfile.txt", O_RDONLY);
    if (fd < 0) {
        perror("open_file_syscall");
    } else {
        printf("File opened successfully with fd: %d\n", fd);
        // Don't forget to close the file descriptor when done
        close(fd);
    }
    return 0;
}
