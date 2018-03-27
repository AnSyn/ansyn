const fs = require('fs');
const url = require('url');
const path = require('path');
const exec = require('child_process').execFile;

let confdUrl = 'https://github.com/kelseyhightower/confd/releases/download/v0.15.0/confd-0.15.0-windows-amd64.exe';
let confdExeExtension = '.exe';
const linuxConfdUrl = 'https://github.com/kelseyhightower/confd/releases/download/v0.15.0/confd-0.15.0-linux-amd64';

if (process.argv[2] == 'linux') {
	confdUrl = linuxConfdUrl;
	confdExeExtension = '';
}

const confdBasePath = 'confd';
const confdDevBasePath = 'confd/dev';
const confdTmplRelPath = '/templates/production.tmpl';
const confdConfigPath = path.join(confdBasePath, '/conf.d/production.toml');
const confdTmplPath = path.join(confdBasePath, confdTmplRelPath);
const devTmplPath = path.join(confdDevBasePath, confdTmplRelPath);
const devConfigPath = path.join(confdDevBasePath, 'conf.d/development.toml');
const confdPath = path.join(confdBasePath, `confd${confdExeExtension}`);


const download = (uri, filename) => {
	console.log(`Downloading ${filename} from ${uri}`);
	const protocol = url.parse(uri).protocol.slice(0, -1);

	return new Promise((resolve, reject) => {
		const onError = (e) => {
			fs.unlink(filename);
			reject(e);
		};

		require(protocol).get(uri, function (response) {
			if (response.statusCode >= 200 && response.statusCode < 300) {
				const fileStream = fs.createWriteStream(filename, { mode: 0o755 });
				fileStream.on('error', onError);
				fileStream.on('close', resolve);
				response.pipe(fileStream);
			} else if (response.headers.location) {
				resolve(download(response.headers.location, filename));
			} else {
				reject(new Error(response.statusCode + ' ' + response.statusMessage));
			}
		}).on('error', onError);
	});
};

const downloadIfNotExists = (uri, filename) => {
	console.log(`Checking if ${filename} exists.`);
	return new Promise(resolve => {
			if (fs.existsSync(filename)) {
				console.log(`${filename} exists, proceeding to the next stage.`);
				resolve();
				return;
			}

			console.log(`${filename} does not exist.`);
			resolve(download(uri, filename));
		});
};

const copyFile = (src, dest, mutationFunc) => {
	return new Promise((resolve, reject) => {
		fs.readFile(src, 'utf8', function (err,data) {
			if (err) {
				reject(err);
				return;
			}
			const result = mutationFunc ? mutationFunc(data) : data;

			fs.writeFile(dest, result, 'utf8', function (err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	});
};

const createDirIfNotExists = (dir) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
};

const createDevConfdConfigFile = () => {
	createDirIfNotExists(confdDevBasePath);
	createDirIfNotExists(path.join(confdDevBasePath, 'conf.d'));
	createDirIfNotExists(path.join(confdDevBasePath, 'templates'));

	console.log('Creating a development toml file.');
	const tmplCopy = copyFile(confdTmplPath, devTmplPath);
	const tomlCopy = copyFile(confdConfigPath, devConfigPath,
		(data) => data.replace(/dest = .*/g, 'dest = "src/app/@ansyn/assets/config/app.config.json"'));

	return Promise.all([tmplCopy, tomlCopy]);
};

const runConfd = () => {
	console.log('Running confd');
	exec(`${confdPath}`, ['-backend', 'env', '-onetime', '-confdir', confdDevBasePath], (error, stdout, stderr) => {
		console.log(stdout);
		console.error(stderr);
		if (error !== null) {
			throw new Error(`exec error: ${error}`);
		}
	});
};

downloadIfNotExists(confdUrl, confdPath)
	.then(() => createDevConfdConfigFile())
	.then(() => runConfd())
	.catch(err => {
		console.error('Failed to generate the configuration');
		console.error(err);
		process.exit(1);
	});

