const fs = require('fs');
const path = require('path');

function isSame(source, other, trace = '', tabs = 0) {
	if (source && typeof source === 'object' && !Array.isArray(source)) {
		Object.keys(source).forEach(key => {
			// console.log('  '.repeat(tabs), 'should have', key);
			if (!(key in other)) {
				throw new Error(trace + '.' + key + ' does not exist');
			}

			if (typeof source[key] === 'object') {
				isSame(source[key], other[key], trace + '.' + key, tabs + 1);
			}
		});
	}
}

let tmpl = fs.readFileSync(path.join(__dirname, '../confd/production.tmpl'), 'utf-8');
tmpl = tmpl.replace(/{{.*?}}/g, 'variable');
const parsedTmpl = JSON.parse(tmpl);

let config = fs.readFileSync(path.join(__dirname, '../src/assets/config/app.config.json'), 'utf-8');
const parsedConfig = JSON.parse(config);

isSame(parsedConfig, parsedTmpl);
