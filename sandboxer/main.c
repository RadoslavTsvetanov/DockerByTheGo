#include <stdio.h>
#include <stdlib.h>
#include <sys/ptrace.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <sys/user.h>
#include <sys/reg.h>
#include <string.h>
#include <errno.h>

// Function to get the string argument from the child process
char* get_string_arg(pid_t target_pid, unsigned long addr) {
    static char buf[256];
    memset(buf, 0, sizeof(buf));
    for (size_t i = 0; i < sizeof(buf) - 1; i += sizeof(long)) {
        long word = ptrace(PTRACE_PEEKDATA, target_pid, addr + i, NULL);
        if (word == -1 && errno) {
            break;
        }
        memcpy(buf + i, &word, sizeof(long));
        if (memchr(&word, 0, sizeof(long))) {
            break;
        }
    }
    return buf;
}

void intercept_syscalls(pid_t target_pid) {
    int status;
    struct user_regs_struct regs;

    while (1) {
        waitpid(target_pid, &status, 0);
        if (WIFEXITED(status)) {
            break;
        }

        // Get registers
        ptrace(PTRACE_GETREGS, target_pid, NULL, &regs);
        // Check for specific syscall numbers
        if (regs.orig_rax == 1) {  // write syscall number
            // Get the arguments
            unsigned long fd = regs.rdi;  // file descriptor
            unsigned long buf_addr = regs.rsi;  // buffer address
            unsigned long count = regs.rdx;  // number of bytes

            char* buf = get_string_arg(target_pid, buf_addr);
            printf("write(%lu, \"%s\", %lu)\n", fd, buf, count);
        } else if (regs.orig_rax == 2) {  // open syscall number
            unsigned long pathname_addr = regs.rdi;  // file path address
            char* pathname = get_string_arg(target_pid, pathname_addr);
            printf("open(\"%s\", ...)\n", pathname);
        }

        // Allow the syscall to proceed
        ptrace(PTRACE_SYSCALL, target_pid, NULL, NULL);
    }
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <program> [args...]\n", argv[0]);
        return 1;
    }

    pid_t child = fork();
    if (child == 0) {
        // Child process
        ptrace(PTRACE_TRACEME, 0, NULL, NULL);
        execvp(argv[1], &argv[1]);
        perror("execvp");
        exit(1);
    } else if (child < 0) {
        perror("fork");
        return 1;
    }

    // Parent process
    intercept_syscalls(child);

    return 0;
}

