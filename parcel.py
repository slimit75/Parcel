"""
Parcel - UNOFFICIAL file generator for the Skunkscraft Updater
Copyright 2025 Ian Ward

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
import fnmatch
import os
import shutil
import sys
import zlib
from pathlib import Path

blacklist_file = Path(".parcelignore")
whitelist_file = open("skunkcrafts_updater_whitelist.txt", "w")
filesize_file = open("skunkcrafts_updater_sizeslist.txt", "w")


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


def clean_iterate(root: str, fp: str, blacklist: list[str]) -> None:
	"""
	Iterate through all files and delete what is unnecessary
	Args:
		root (str): Root directory, used in generating skunkcrafts files
		fp (str): Folder to iterate through.
		blacklist (list[str]): Files to skip.
	"""
	for file_name in os.listdir(fp):
		skip = False
		for item in blacklist:
			if fnmatch.fnmatch(file_name, item) or file_name.startswith("."):
				skip = True
				break

		file_path = os.path.join(fp, file_name)
		if skip:
			if file_name == "skunkcrafts_updater.cfg" or file_name == "skunkcrafts_updater_beta.cfg":
				print("Preserving file", file_path)  # skip
			elif Path.is_dir(Path(file_path)):
				print("Clearing directory", file_path)
				shutil.rmtree(os.path.join(os.curdir, file_path))
			else:
				print("Clearing", file_path)
				os.remove(os.path.join(os.curdir, file_path))

		elif os.path.isdir(file_path):
			clean_iterate(root, file_path, blacklist)
		else:
			file_path_out = file_path.replace(root + "/", "", 1)
			whitelist_file.write(f"{file_path_out}|{str(crc32(file_path))}\n")
			filesize_file.write(f"{file_path_out}|{str(size(file_path))}\n")


def main():
	blacklist: list[str] = []

	input_folder = sys.argv[1]

	if not blacklist_file.is_file():
		print("Ignore file does not exist! Extra files may be added!")
	else:
		blacklist = blacklist_file.open().read().splitlines()

	clean_iterate(input_folder, input_folder, blacklist)

	whitelist_file.close()
	filesize_file.close()

	print("Generating", input_folder + ".zip")
	shutil.make_archive(input_folder, "zip", input_folder)

	shutil.move("skunkcrafts_updater_sizeslist.txt", input_folder)
	shutil.move("skunkcrafts_updater_whitelist.txt", input_folder)

main()
