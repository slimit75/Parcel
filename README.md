# Parcel
Parcel is a Python script designed to simplify the distribution of add-on aircraft for X-Plane via the [Skunkscrafts Updater](https://forums.x-plane.org/index.php?/forums/forum/406-skunkcrafts-updater/).

> [!WARNING]
> There are no guarantees when using this. Instead of contacting the original developers like a sane person, I tried reverse-engineering how it works instead.

## Usage
To use, run the following:
```sh
python parcel.py [input folder]
```
Where:
* `input folder` is a copy of the aircraft root folder (the folder with the .acf file)

Important things to note:
* **The input folder must be a copy!** Parcel will delete any file that is included in `.parcelignore` OR any file that starts with a period.
* The output archive does not include the `skunkcrafts_updater_*` files. Those files are copied into the `input folder` after the creation of the output file. You should have new users download the output file on first install, and upload the input folder to your server.