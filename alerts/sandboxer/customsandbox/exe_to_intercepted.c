#include <fcntl.h>  // For open()
#include <sys/stat.h> // For mode constants
#include <unistd.h> // For close()
#include <stdio.h>

int create_file(const char *filename) {
    // Use open() with O_CREAT to create the file
    int fd = open(filename, O_WRONLY | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);
    
    if (fd == -1) {
        return -1; // Return -1 on error
    }

    // Close the file descriptor
    close(fd);
    return 0; // Return 0 on success
}

int main() {
    create_file("example.txt");
printf(" =n" );
    return 0;
}

