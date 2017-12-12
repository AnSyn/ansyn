import { Inject, Injectable, InjectionToken } from '@angular/core';

export type Severity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'
interface ILoggerConfig {
	env: 'DEV' | 'PROD',
}
export const LoggerConfig: InjectionToken<any> = new InjectionToken('logger-config');

@Injectable()
export class LoggerService {
	env = 'ENV';
	standardPrefix = '';
	constructor(@Inject(LoggerConfig) protected loggerConfig: ILoggerConfig) {
		this.env = this.loggerConfig.env;
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
