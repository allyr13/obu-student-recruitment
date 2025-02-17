import subprocess

with open('requirements.txt', 'r') as file:
    libraries = file.readlines()

for library in libraries:
    library = library.strip()
    if library:
        command = f'conda install {library} -y'
        subprocess.run(command, shell=True)
