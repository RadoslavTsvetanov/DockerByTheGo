import subprocess
import os

# Command to execute (for example, creating a file)
command = ['cargo', 'run', "../exe_to_be_intercepted"]  # Change this command as needed

# Execute the command
subprocess.run(command)

# Check for the existence of the file
file_path = 'example3.txt'
if os.path.exists(file_path):
    print(f"{file_path} exists.")
    print("test failed")
    os.remove("./example3.txt")
else:
    print(f"{file_path} does not exist.")

