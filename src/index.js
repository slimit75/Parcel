// for future reference, because I am new to this stuff, see:
// https://docs.github.com/en/actions/tutorials/create-actions/create-a-javascript-action

const core = require("@actions/core");
const exec = require('@actions/exec');
const {DefaultArtifactClient} = require('@actions/artifact')

const artifact = new DefaultArtifactClient();

async function UploadFile(name, path) {
	const {id, size} = await artifact.uploadArtifact(
		name,
		path, // files to include (supports absolute and relative paths)
		""
	);

	console.log(`Created artifact with id: ${id} (bytes: ${size}`);
}

async function main() {
	// TODO: this input should probably be sanitized
	const acf_in = core.getInput("acf-in-name");

	// TODO: this logic should probably be refactored into this script
	await exec.exec('curl -O https://raw.githubusercontent.com/slimit75/Parcel/refs/heads/main/parcel.py');
	await exec.exec(`python parcel.py ${acf_in}`);

	await UploadFile('SkunkCraft Updater server files', `${acf_in}.zip`);
	await UploadFile('Aircraft.zip', 'output/*');
}

try {
	main().then(r => 1);
} catch (error) {
	core.setFailed(error.message);
}
