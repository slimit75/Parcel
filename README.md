# Parcel
Parcel is a Python script designed to simplify the distribution of add-on aircraft for X-Plane via the [Skunkscraft Updater](https://forums.x-plane.org/index.php?/forums/forum/406-skunkcrafts-updater/).

**There is no guarantee that this will work. Instead of contacting the developers like a sane person, I tried reverse-engineering how it works instead. Seemed easier than talking to someone.**

To use:
1. Drag your aircraft files into [workdir](./workdir).
2. (Optional) Drag your .parcelignore file into the [same directory as the script](./). An example file as used in the SimSolutions DA40 is provided, but keep in mind it **only takes full file names** right now.
3. Run the python script.
4. The resulting files will be left in [workdir](./workdir). Enjoy?

After this is done, you can:
1. Compress the files in [workdir](./workdir) to distribute as normal.
2. Upload the files in [workdir](./workdir) alongside the `skunkscraft_updater_*list.txt` files in the [directory with the script](./).