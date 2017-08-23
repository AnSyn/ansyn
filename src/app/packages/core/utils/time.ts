
export class TimeDiff {
	isNegative: boolean;
	seconds: number;
	minutes: number;
	hours: number;

	constructor(hours: number, minutes: number, seconds: number, isNegative: boolean = false) {
		this.hours = hours;
		this.minutes = minutes;
		this.seconds = seconds;
		this.isNegative = isNegative;
	}
}

export function getTimeDiff(date1: Date, date2: Date): TimeDiff {
	let millisecondsDiff = (date1.getTime() - date2.getTime());
	let isNegative = false;
	if (millisecondsDiff < 0) {
		isNegative = true;
		millisecondsDiff *= -1;
	}

	const hours = Math.floor(millisecondsDiff / 1000 / 60 / 60);
	millisecondsDiff -= hours * 1000 * 60 * 60;
	const minutes = Math.floor(millisecondsDiff / 1000 / 60);
	millisecondsDiff -= minutes * 1000 * 60;
	const seconds = Math.floor(millisecondsDiff / 1000);
	millisecondsDiff -= seconds * 1000;
    const result = new TimeDiff(hours, minutes, seconds, isNegative);
	return result;
}

export function getTimeDiffFormat(timeDiff: TimeDiff): string {
	return `${timeDiff.isNegative ? '-' : ''} ${timeDiff.hours} : ${timeDiff.minutes} : ${timeDiff.seconds}`;
}
