export function startTimingLog(key) {
	if (window && window.localStorage) {
		if (localStorage.getItem('ansyn-logTimerOn')) {
			console.time(key);
		}
	}
}

export function endTimingLog(key) {
	if (window && window.localStorage) {
		if (localStorage.getItem('ansyn-logTimerOn')) {
			console.timeEnd(key);
		}
	}
}

export function getErrorMessageFromException(error: any, defaultError: string): string {
	const result = error.message ? error.message : error.statusText ? error.statusText : defaultError;
	return result;
}

export function getErrorLogFromException(error: any, defaultError: string): string {
	const result = Boolean(error) ? JSON.stringify(error) : defaultError;
	return result;
}

export interface ILogMessage {
	payload?: any;
	logMessage: Function;
}

export function actionHasLogMessage(action: ILogMessage): boolean {
	return Boolean(action.logMessage);
}

export function getLogMessageFromAction(action: ILogMessage): string {
	return action.logMessage ? action.logMessage() : action.payload ? JSON.stringify(action.payload) : '';
}
