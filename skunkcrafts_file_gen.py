'''
SimSolutions SKUFG

File generator for the Skunkscraft Updater
2024 Ian Ward
'''
import os
import zlib

working_dir = os.curdir
blacklist = { "README.md", "README.odt", ".git", ".github", ".idea", ".cmake", "config.cfg", "config.cfg", "cmake-build-relwithdebinfo", "cmake-build-release", "cmake-build-debug", "libs", "src", "exports.txt", "CMakeLists.txt", ".gitmodules", "DA40-XP12_prefs.txt", "DA40-XP11_prefs.txt", "skunkcrafts_updater_whitelist.txt", "skunkcrafts_updater.cfg", "skunkcrafts_updater_beta.cfg", "skunkcrafts_file_gen.py", "DA40-XP12.acf~", "DA40-XP11.acf~", "skunkcrafts_updater_sizeslist.txt", ".gitignore", "persistence.cfg" }
whitelist_file = open("skunkcrafts_updater_whitelist.txt", "w")
filesize_file = open("skunkcrafts_updater_sizeslist.txt", "w")

# Functions adapted from
# https://discord.com/channels/397379810067742721/529085059324444672/1228246467035140147
# https://discord.com/channels/397379810067742721/529085059324444672/1228246563562721290
def size(file_path) -> int:
    """Return the size of the file."""
    size = os.stat(file_path).st_size
    return size

def crc32(file_path) -> int:
    """Return the CRC32 checksum of the file."""
    with open(file_path, mode="rb") as binary_io:
        checksum: int = 0
        chunksize = 65536
        while chunk := binary_io.read(chunksize):
            checksum = zlib.crc32(chunk, checksum)
    crc32 = checksum
    return crc32

def contains(array, string):
    for item in array:
        if item == string:
            return True
    return False

def iterate(folder):
    for files in os.listdir(folder):
        if contains(blacklist, files):
            print("Skipping " + os.path.join(folder, files))
        elif os.path.isdir(os.path.join(folder, files)):
            iterate(os.path.join(folder, files))
        else:
            whitelist_file.write(os.path.join(folder, files) + "|" + str(crc32(os.path.join(folder, files))) + "\n")
            filesize_file.write(os.path.join(folder, files) + "|" + str(size(os.path.join(folder, files))) + "\n")

iterate(working_dir)

whitelist_file.close()
filesize_file.close()