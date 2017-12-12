export type Severity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'

interface MinimalLogger{
	error(msg: string);
	warn(msg: string);
	info(msg: string);
}

export class AnsynLogger implements MinimalLogger {
	static activeLogger = new AnsynLogger('ENV');	// default logger (unknown environment)
	env: string;
	standardPrefix: string;

	constructor(environment: string) {
		this.env = environment;
		this.standardPrefix = `Ansyn[${this.env}]`
	}

	critical(msg: string) {
		this._log('CRITICAL', msg, true);
	}
	error(msg: string) {
		this._log('ERROR', msg, true);
	}
	warn(msg: string) {
		this._log('WARNING', msg);
	}
	info(msg: string) {
		this._log('INFO', msg);
	}
	debug(msg: string) {
		this._log('DEBUG', msg);
	}

	private _log(severity: Severity, msg: string, includeBrowserData?: boolean) {
		let prefix = `${this.standardPrefix}[${Date()}]`;
		if (includeBrowserData) {
			prefix += `[window:${window.innerWidth}x${window.innerHeight}][userAgent: ${navigator.userAgent}]`
		}
		const str = `${prefix}[${severity}] ${msg}`;
		this._output(severity, str);
	}

	private _output(severity: Severity, msg: string) {
		switch (severity) {
			// case 'CRITICAL':
			// case 'ERROR':
			// 	console.error(msg);
			// 	break;
			// case 'WARNING':
			// 	console.warn(msg);
			// 	break;
			// case 'INFO':
			// case 'DEBUG':
			// 	console.log(msg);
			// 	break;
		}
	}
}
