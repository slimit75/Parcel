'''
SimSolutions Parcel

File generator for the Skunkscraft Updater
2024 Ian Ward
'''
import os
import zlib

blacklist = { "README.md", "README.odt", ".git", ".github", ".idea", ".cmake", "config.cfg", "config.cfg", "cmake-build-relwithdebinfo", "cmake-build-release", "cmake-build-debug", "libs", "src", "exports.txt", "CMakeLists.txt", ".gitmodules", "DA40-XP12_prefs.txt", "DA40-XP11_prefs.txt", "skunkcrafts_updater_whitelist.txt", "skunkcrafts_updater.cfg", "skunkcrafts_updater_beta.cfg", "parcel.py", "DA40-XP12.acf~", "DA40-XP11.acf~", "skunkcrafts_updater_sizeslist.txt", ".gitignore", "persistence.cfg" }
whitelist_file = open("skunkcrafts_updater_whitelist.txt", "w")
filesize_file = open("skunkcrafts_updater_sizeslist.txt", "w")

# Return the size of the file.
# Adapted from https://discord.com/channels/397379810067742721/529085059324444672/1228246563562721290
def size(file_path) -> int:
    size = os.stat(file_path).st_size
    return size

# Return the CRC32 checksum of the file.
# Adapted from https://discord.com/channels/397379810067742721/529085059324444672/1228246467035140147
def crc32(fp) -> int:
    with open(fp, mode="rb") as binary_io:
        checksum: int = 0
        chunksize = 65536
        while chunk := binary_io.read(chunksize):
            checksum = zlib.crc32(chunk, checksum)
    crc32 = checksum
    return crc32

# TODO: this looks immensely stupid
def contains(array, string) -> bool:
    for item in array:
        if item == string:
            return True
    return False

# Iterate through all files and determine what is necessary
def iterate(fp) -> None:
    for files in os.listdir(fp):
        if contains(blacklist, files):
            print("Skipping " + os.path.join(fp, files))
        elif os.path.isdir(os.path.join(fp, files)):
            iterate(os.path.join(fp, files))
        else:
            whitelist_file.write(f"{os.path.join(fp, files)}|{str(crc32(os.path.join(fp, files)))}\n")
            filesize_file.write(f"{os.path.join(fp, files)}|{str(size(os.path.join(fp, files)))}\n")

iterate(os.curdir)

whitelist_file.close()
filesize_file.close()