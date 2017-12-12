import { Inject, Injectable, InjectionToken } from '@angular/core';

export type Severity = 'critical' | 'error' | 'warning' | 'info' | 'debug'
interface ILoggerConfig {
	env: 'DEV' | 'PROD',
}
export const LoggerConfig: InjectionToken<ILoggerConfig> = new InjectionToken('logger-config');

@Injectable()
export class LoggerService {
	env;
	// constructor(@Inject(LoggerConfig) protected loggerConfig: ILoggerConfig) {
	constructor() {
		console.log('Logger is On!')
	}

	critical(msg: string) {
		this._log('critical', msg);
	}
	error(msg: string) {
		this._log('error', msg);
	}
	warn(msg: string) {
		this._log('warning', msg);
	}
	info(msg: string) {
		this._log('info', msg);
	}
	debug(msg: string) {
		this._log('debug', msg);
	}

	//
	private _output(severity: Severity, msg: string) {
		switch (severity) {
			case 'critical':
			case 'error':
				console.error(msg);
				break;
			case 'warning':
				console.warn(msg);
				break;
			case 'info':
			case 'debug':
				console.log(msg);
				break;
		}
	}
	private _log(severity: Severity, msg: string) {
		// if (typeof msg !== 'string') {
		// 	msg = JSON.stringify(msg);
		// }
		const str = `Ansyn[${this.env}][${Date()}][${severity}]:${msg}`;
		this._output(severity, str);
	}
}
