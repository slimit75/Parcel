/*
    Parcel - UNOFFICIAL file generator for the Skunkscraft Updater
    Copyright 2026 Ian Ward

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import * as core from '@actions/core'
import {DefaultArtifactClient} from "@actions/artifact";
import {crc32} from "@foxglove/crc";
import * as fs from "node:fs/promises";
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {minimatch} from 'minimatch';
import {fileMove} from './helpers.js';

const artifact = new DefaultArtifactClient();

let blacklist_file: fs.FileHandle;
let whitelist_file: fs.FileHandle;
let sizelist_file: fs.FileHandle;

/**
 * Upload a file as an artifact
 *
 * @param name Name to show up under the artifacts section
 * @param paths Path to file
 */
async function UploadFile(name: string, paths: string[]) {
    const {id, size} = await artifact.uploadArtifact(name, paths, <string>process.env.GITHUB_WORKSPACE);

    core.debug(`Created artifact with id: ${id} (bytes: ${size})`);
}

/**
 * Calculates the checksum & relevant file size from a file
 *
 * @param fp File path
 */
async function calc_details(fp: string): Promise<{ checksum: number, size: number }> {
    // Thanks to https://stackoverflow.com/a/76978551
    const handler = await fs.open(fp, 'r');
    const {buffer, bytesRead} = await handler.read();
    await handler.close();

    return {
        checksum: crc32(buffer),
        size: bytesRead
    };
}

/**
 * Iterate through all files and delete what is unnecessary
 *
 * @param root Root directory, used in generating skunkcrafts files
 * @param fp Folder to iterate through.
 * @param blacklist Files to skip.
 */
async function clean_iterate(root: string, fp: string, blacklist: string[]): Promise<void> {
    const files = await fs.readdir(fp);

    for (const file of files) {
        let skip = false;
        let file_path: string = join(fp, file);

        blacklist.forEach(item => {
            if (minimatch(file_path, item, { partial: true, matchBase: true }) || file.startsWith(".")) {
                skip = true;
            }
        });

        let isDirectory: boolean = false;
        const stats = await fs.stat(file_path);
        isDirectory = stats.isDirectory();

        if (skip) {
            if ((file == "skunkcrafts_updater.cfg") || (file == "skunkcrafts_updater_beta.cfg")) {
                core.debug(`Preserving file ${file_path}`); // skip
            } else {
                core.debug(`Clearing ${file_path}`);
                await fs.rm(file_path, {recursive: true});
            }
        } else if (isDirectory) {
            await clean_iterate(root, file_path, blacklist);
        } else {
            let file_path_out = file_path.replace(root, "");
            let {checksum, size} = await calc_details(file_path);

            await whitelist_file.write(`${file_path_out}|${checksum}\n`);
            await sizelist_file.write(`${file_path_out}|${size}\n`);
        }
    }
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    try {
        // Load and read blacklist file
        blacklist_file = await fs.open(".parcelignore", "r");
        let blacklist: string[] = [];
        for await (const line of blacklist_file.readLines()) {
            blacklist.push(line);
        }
        await blacklist_file.close();

        // Create whitelist & sizelist files
        whitelist_file = await fs.open("skunkcrafts_updater_whitelist.txt", "w");
        sizelist_file = await fs.open("skunkcrafts_updater_sizeslist.txt", "w");

        // Load input folder and determine output folder
        const input_folder = core.getInput("acf-in-name"); // TODO: this input should probably be sanitized
        let output_folder = await fs.mkdtemp(join(tmpdir(), 'output-'));

        // Iterate through files untile done and close whitelist & sizelist files
        await clean_iterate(input_folder, input_folder, blacklist);

        await whitelist_file.close();
        await sizelist_file.close();

        // Move whitelist & sizelist files
        fileMove("skunkcrafts_updater_sizeslist.txt", `${output_folder}/skunkcrafts_updater_sizeslist.txt`);
        fileMove("skunkcrafts_updater_whitelist.txt", `${output_folder}/skunkcrafts_updater_whitelist.txt`);

        // Upload files as artifacts
        await UploadFile(`${input_folder}.zip`, [
            input_folder
        ]);

        await UploadFile('Server manifest files', [
            `${output_folder}/skunkcrafts_updater_sizeslist.txt`,
            `${output_folder}/skunkcrafts_updater_whitelist.txt`
        ]);
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message);
    }
}