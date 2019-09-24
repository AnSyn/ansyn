import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { LoggerConfig } from '../models/logger.config';
import { ILoggerConfig } from '../models/logger-config.model';
import { Debounce } from 'lodash-decorators';
import * as momentNs from 'moment';
const moment = momentNs;

export type Severity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'

export interface ILogObject {
	severity: string;
	msg: string;
}

@Injectable()
export class LoggerService implements ErrorHandler {
	env = 'ENV'; // default (unknown environment)
	componentName = 'app';
	stack: ILogObject[] = [];
	disconnectionInMilliseconds: number;
	timeoutCookie;
	isConnected: boolean;
	connectionTime: Date;

	beforeAppClose() {
		this.info('app closed');
		this.setClientAsDisconnected();
	}

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
		this.componentName = loggerConfig.componentName;
		this.disconnectionInMilliseconds = new Date().getTime() - moment().subtract(this.loggerConfig.disconnectionTimeoutInMinutes, 'minutes').toDate().getTime();
		this.isConnected = false;
		window.onerror = (e) => {
			this.error(e.toString());
		};
	}

	get standardPrefix() {
		return `Ansyn[${ this.env }, ${this.componentName}]`;
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
		this.updateLogTimeForDisconnect();
		let prefix = `${ this.standardPrefix }[${ Date() }]`;
		if (includeBrowserData) {
			prefix += `[window:${ window.innerWidth }x${ window.innerHeight }][userAgent: ${ navigator.userAgent }]`;
		}
		const str = `${ prefix }[${ severity }] ${ msg }`;
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

	setClientAsConnected() {
		if (!this.isConnected) {
			this.connectionTime = new Date();
		}
		this.isConnected = true;
	}

	setClientAsDisconnected() {
		this.isConnected = false;
	}

	private updateLogTimeForDisconnect() {
		if (!this.isConnected) {
			this.setClientAsConnected();
		}

		if (this.timeoutCookie) {
			window.clearTimeout(this.timeoutCookie);
			this.timeoutCookie = null;
		}

		this.timeoutCookie = window.setTimeout(() => {
			if (this.isConnected) {
				this.setClientAsDisconnected();
				window.clearTimeout(this.timeoutCookie);
				this.timeoutCookie = null;
			}
		}, this.disconnectionInMilliseconds);
	}
}
