// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const {SpecReporter} = require('jasmine-spec-reporter');

exports.config = {
	allScriptsTimeout: 11000,
	specs: [
		'./e2e/**/*.e2e-spec.ts'
	],
	capabilities: {
		'browserName': 'chrome',
		'shardTestFiles': true,
		'maxInstances': 5
	},
	directConnect: true,
	baseUrl: 'http://localhost:4200/',
	framework: 'jasmine2',
	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000,
		print: function () {
		}
	},
	beforeLaunch: function () {
		require('ts-node').register({
			project: 'e2e/tsconfig.e2e.json'
		});
	},
	plugins: [{
		package: 'protractor-screenshoter-plugin',
		screenshotPath: './e2e/REPORTS',
		screenshotOnExpect: 'failure+success',
		screenshotOnSpec: 'none',
		withLogs: 'true',
		writeReportFreq: 'asap',
		imageToAscii: 'none',
		clearFoldersBeforeTest: true
	}],
	onPrepare() {
		jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
		// returning the promise makes protractor wait for the reporter config before executing tests
		return global.browser.getProcessedConfig().then(function(config) {
			//it is ok to be empty
		});

	}
};
