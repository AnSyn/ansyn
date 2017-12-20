import { Inject, Injectable } from '@angular/core';
import { LoggerConfig } from '../models/logger.config';
import { ILoggerConfig } from '../models/logger-config.model';

export type Severity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'

@Injectable()
export class LoggerService {
	env = 'ENV'; // default (unknown environment)

	constructor(@Inject(LoggerConfig) loggerConfig: ILoggerConfig) {
		this.env = loggerConfig.env;
	}

	get standardPrefix() {
		return `Ansyn[${this.env}]`;
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
			prefix += `[window:${window.innerWidth}x${window.innerHeight}][userAgent: ${navigator.userAgent}]`;
		}
		const str = `${prefix}[${severity}] ${msg}`;
		this.output(severity, str);
	}

	// To override the output function:
	// this.output = function (severity: Severity, msg: string) {
	output(severity: Severity, msg: string) {
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
