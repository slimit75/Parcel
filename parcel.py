"""
Parcel

File generator for the Skunkscraft Updater
2024 Ian Ward
"""
import os
import re
import shutil
import zlib
from pathlib import Path

blacklist_file = Path(".parcelignore")
whitelist_file = open("workdir/skunkcrafts_updater_whitelist.txt", "w")
filesize_file = open("workdir/skunkcrafts_updater_sizeslist.txt", "w")


def size(file_path: str) -> int:
	"""
	Returns the size of the file.
	Args:
		file_path (str): Path to the current file.
	Returns:
		int: Size of the file, as calculated by os.stat()
	"""
	# Adapted from https://discord.com/channels/397379810067742721/529085059324444672/1228246563562721290
	return os.stat(file_path).st_size


def crc32(fp: str) -> int:
	"""
	Returns the CRC32 checksum of the file.
	Args:
		fp (str): Path to the current file
	Returns:
		int: CRC32 checksum.
	"""
	# Adapted from https://discord.com/channels/397379810067742721/529085059324444672/1228246467035140147
	with open(fp, mode="rb") as binary_io:
		checksum: int = 0
		chunksize = 65536
		while chunk := binary_io.read(chunksize):
			checksum = zlib.crc32(chunk, checksum)
	return checksum


def iterate(fp: str, blacklist: list[str]) -> None:
	"""
	Iterate through all files and determine what is necessary
	Args:
		fp (str): Folder to iterate through.
		blacklist (list[str]): Files to skip.
	"""
	for files in os.listdir(fp):
		skip = False
		for item in blacklist:
			if re.search(item, files):
				skip = True
				break

		file_path = os.path.join(fp, files)
		if skip:
			print("Skipping " + file_path)
			if Path.is_dir(Path(file_path)):
				shutil.rmtree(os.path.join(os.curdir, file_path))
			else:
				os.remove(os.path.join(os.curdir, file_path))

		elif os.path.isdir(file_path):
			iterate(file_path, blacklist)
		else:
			whitelist_file.write(f"{file_path}|{str(crc32(file_path))}\n")
			filesize_file.write(f"{file_path}|{str(size(file_path))}\n")


def main():
	fp = Path.joinpath(Path(os.curdir), "workdir")
	blacklist: list[str] = []

	if not blacklist_file.is_file():
		print("Ignore file does not exist! Extra files may be added!")
	else:
		blacklist = blacklist_file.open().read().splitlines()

	iterate(fp.name, blacklist)

	whitelist_file.close()
	filesize_file.close()

main()