import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { LoggerConfig } from '../models/logger.config';
import { ILoggerConfig } from '../models/logger-config.model';
import { Debounce } from 'lodash-decorators';

export type Severity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'

export interface LogObject {
	severity: string;
	msg: string;
}

@Injectable()
export class LoggerService implements ErrorHandler {
	env = 'ENV'; // default (unknown environment)
	stack: LogObject[] = [];

	handleError(error: any): void {
		if (error.stack) {
			this.error(error.stack);
		} else {
			this.error(error.toString());
		}
		// IMPORTANT: Rethrow the error otherwise it gets swallowed
		throw error;
	}

	constructor(@Inject(LoggerConfig) public loggerConfig: ILoggerConfig) {
		this.env = loggerConfig.env;
		window.onerror = function (e) {
			this.error(e.toString());
		};
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
		if (!this.loggerConfig.active) {
			return;
		}
		let prefix = `${this.standardPrefix}[${Date()}]`;
		if (includeBrowserData) {
			prefix += `[window:${window.innerWidth}x${window.innerHeight}][userAgent: ${navigator.userAgent}]`;
		}
		const str = `${prefix}[${severity}] ${msg}`;
		this.stack.push({ severity, msg: str });
		this.output();
	}

	@Debounce(1000)
	output() {
		this.stack.forEach(({ severity, msg }) => {
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
		});
		this.stack = [];
	}

}
