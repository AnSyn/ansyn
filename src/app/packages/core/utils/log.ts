export function startTimingLog(key){
	console.time('ansyn ' + key);
}

export function endTimingLog(key){
	console.timeEnd('ansyn ' +  key);
}
