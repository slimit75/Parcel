import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {DefaultArtifactClient} from "@actions/artifact";
import {crc32} from "@foxglove/crc";
import {open} from "fs/promises";
import {FileHandle} from "node:fs/promises";

const artifact = new DefaultArtifactClient();

/**
 * Upload a file as an artifact
 *
 * @param name Name to show up under the artifacts section
 * @param paths Path to file
 */
async function UploadFile(name: string, paths: string[]) {
    const {id, size} = await artifact.uploadArtifact(name, paths, <string>process.env.GITHUB_WORKSPACE);

    core.debug(`Created artifact with id: ${id} (bytes: ${size}`);
}

/**
 * Calculates the checksum & relevant file size from a file
 *
 * @param fp File path
 */
async function calc_details(fp: string): Promise<{ checksum: number, size: number }> {
    // Thanks to https://stackoverflow.com/a/76978551
    const handler: FileHandle = await open(fp, 'r');
    const {buffer, bytesRead} = await handler.read()

    return {
        checksum: crc32(buffer),
        size: bytesRead
    };
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    try {
        // TODO: this input should probably be sanitized
        const acf_in = core.getInput("acf-in-name");

        // TODO: this logic should probably be refactored into this script
        await exec.exec('curl -O https://raw.githubusercontent.com/slimit75/Parcel/refs/heads/main/parcel.py');
        await exec.exec(`python parcel.py ${acf_in}`);

        await UploadFile('Aircraft redistributable', [`${acf_in}.zip`]);
        await UploadFile('Server manifest files', [
            'output/skunkcrafts_updater_sizeslist.txt',
            'output/skunkcrafts_updater_whitelist.txt'
        ]);
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message)
    }
}
