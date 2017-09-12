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
