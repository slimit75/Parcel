'use strict';

var require$$0 = require('@actions/core');
var require$$1 = require('@actions/exec');
var require$$2 = require('@actions/artifact');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var src = {};

var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;
	// for future reference, because I am new to this stuff, see:
	// https://docs.github.com/en/actions/tutorials/create-actions/create-a-javascript-action

	const core = require$$0;
	const exec = require$$1;
	const {DefaultArtifactClient} = require$$2;

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
	return src;
}

var srcExports = requireSrc();
var index = /*@__PURE__*/getDefaultExportFromCjs(srcExports);

module.exports = index;
//# sourceMappingURL=index.js.map
