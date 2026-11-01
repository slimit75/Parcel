// for future reference, because I am new to this stuff, see:
// https://docs.github.com/en/actions/tutorials/create-actions/create-a-javascript-action

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {DefaultArtifactClient} from "@actions/artifact";

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
