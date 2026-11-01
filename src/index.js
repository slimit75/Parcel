// for future reference, because I am new to this stuff, see:
// https://docs.github.com/en/actions/tutorials/create-actions/create-a-javascript-action

import * as core from "@actions/core";
import * as github from "@actions/github";
const exec = require('@actions/exec');
const {DefaultArtifactClient} = require('@actions/artifact')

try {
	const artifact = new DefaultArtifactClient()

	// TODO: this input should probably be sanitized
	const acf_in = core.getInput("acf-in-name");

	// TODO: this logic should probably be refactored into this script
	await exec.exec('curl -O https://raw.githubusercontent.com/slimit75/Parcel/refs/heads/main/parcel.py');
	await exec.exec(`python parcel.py ${acf_in}`);

	const {id_1, size_1} = await artifact.uploadArtifact(
	  'Aircraft.zip',
	  ['${acf_in}.zip'], // files to include (supports absolute and relative paths)
		 ""
	)

	console.log(`Created artifact with id: ${id_1} (bytes: ${size_1}`)

	const {id_2, size_2} = await artifact.uploadArtifact(
	  'SkunkCraft Updater server files',
	  ['output/*'], // files to include (supports absolute and relative paths)
		 ""
	)

	console.log(`Created artifact with id: ${id_2} (bytes: ${size_2}`)
} catch (error) {
	core.setFailed(error.message);
}
