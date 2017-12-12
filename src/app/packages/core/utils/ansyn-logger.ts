export type Severity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'

interface MinimalLogger{
	error(msg: string);
	warn(msg: string);
	info(msg: string);
}

export class AnsynLogger implements MinimalLogger {
	protected static _activeLogger = new AnsynLogger('ENV');	// default logger (unknown environment)
	// when extending AnsynLogger - override the following get/set functions
	public static set activeLogger(logger: AnsynLogger) {
		AnsynLogger._activeLogger = logger;
	}
	public  static get activeLogger(): AnsynLogger {
		return AnsynLogger._activeLogger;
	}

	env: string;
	standardPrefix: string;



	constructor(env: string) {
		this.standardPrefix = `Ansyn[${this.env}]`
	}

	critical(msg: string) {
		this.log('CRITICAL', msg, true);
	}
	error(msg: string) {
		this.log('ERROR', msg, true);
	}
	warn(msg: string) {
		this.log('WARNING', msg);
	}
	info(msg: string) {
		this.log('INFO', msg);
	}
	debug(msg: string) {
		this.log('DEBUG', msg);
	}

	protected log(severity: Severity, msg: string, includeBrowserData?: boolean) {
		let prefix = `${this.standardPrefix}[${Date()}]`;
		if (includeBrowserData) {
			prefix += `[window:${window.innerWidth}x${window.innerHeight}][userAgent: ${navigator.userAgent}]`
		}
		const str = `${prefix}[${severity}] ${msg}`;
		this.output(severity, str);
	}

	protected output(severity: Severity, msg: string) {
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
