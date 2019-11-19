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
