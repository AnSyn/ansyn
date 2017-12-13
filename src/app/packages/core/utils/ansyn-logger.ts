export type Severity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'

export class  AnsynLogger {
	protected static env = 'ENV'; // default (unknown environment)
	protected static standardPrefix = `Ansyn[${AnsynLogger.env}]`

	static init(env: string) {
		AnsynLogger.env = env;
		AnsynLogger.standardPrefix = `Ansyn[${AnsynLogger.env}]`
	}

	static critical(msg: string) {
		AnsynLogger.log('CRITICAL', msg, true);
	}
	static error(msg: string) {
		AnsynLogger.log('ERROR', msg, true);
	}
	static warn(msg: string) {
		AnsynLogger.log('WARNING', msg);
	}
	static info(msg: string) {
		AnsynLogger.log('INFO', msg);
	}
	static debug(msg: string) {
		AnsynLogger.log('DEBUG', msg);
	}

	protected static log(severity: Severity, msg: string, includeBrowserData?: boolean) {
		let prefix = `${this.standardPrefix}[${Date()}]`;
		if (includeBrowserData) {
			prefix += `[window:${window.innerWidth}x${window.innerHeight}][userAgent: ${navigator.userAgent}]`
		}
		const str = `${prefix}[${severity}] ${msg}`;
		AnsynLogger.output(severity, str);
	}

	protected static output(severity: Severity, msg: string) {
		switch (severity) {
			case 'CRITICAL':
			case 'ERROR':
				console.error(msg);
				break;
			case 'WARNING':
				console.warn(msg);
				break;
			case 'INFO':
			case 'DEBUG':
				console.log(msg);
				break;
		}
	}
}
