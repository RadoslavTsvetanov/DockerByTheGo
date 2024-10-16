#include <fcntl.h>    // For open()
#include <unistd.h>   // For write(), close()
#include <stdio.h>    // For perror()

int main() {
    // Open the file (creates if not exists, write only, with user read/write permissions)
    int file_descriptor = open("example.txt", O_WRONLY | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);
    if (file_descriptor < 0) {
        perror("Failed to open file");
        return 1;
    }

    // Data to write
    const char *data = "hui was here";
    ssize_t bytes_written = write(file_descriptor, data, 14); // 14 is the length of the string
    if (bytes_written < 0) {
        perror("Failed to write to file");
        close(file_descriptor); // Always close the file descriptor
        return 1;
    }

    // Close the file
    if (close(file_descriptor) < 0) {
        perror("Failed to close file");
        return 1;
    }

    return 0;
}

