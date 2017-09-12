export class TimeDiff {
	isNegative: boolean;
	seconds: number;
	minutes: number;
	hours: number;
	days: number;
	months: number;
	years: number;

	constructor(years: number, months: number, days: number,
				hours: number, minutes: number, seconds: number,
				isNegative: boolean = false) {
		this.years = years;
		this.months = months;
		this.days = days;
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
	const years = Math.floor(millisecondsDiff / 1000 / 60 / 60 / 24 / 30 / 12);
	millisecondsDiff -= years * 1000 * 60 * 60 * 24 * 30 * 12;
	const months = Math.floor(millisecondsDiff / 1000 / 60 / 60 / 24 / 30);
	millisecondsDiff -= months * 1000 * 60 * 60 * 24 * 30;
	const days = Math.floor(millisecondsDiff / 1000 / 60 / 60 / 24);
	millisecondsDiff -= days * 1000 * 60 * 60 * 24;
	const hours = Math.floor(millisecondsDiff / 1000 / 60 / 60);
	millisecondsDiff -= hours * 1000 * 60 * 60;
	const minutes = Math.floor(millisecondsDiff / 1000 / 60);
	millisecondsDiff -= minutes * 1000 * 60;
	const seconds = Math.floor(millisecondsDiff / 1000);
	millisecondsDiff -= seconds * 1000;
	const result = new TimeDiff(years, months, days, hours, minutes, seconds, isNegative);
	return result;
}

export function getTimeDiffFormat(timeDiff: TimeDiff): string {
	let result = `${timeDiff.isNegative ? '-' : ''} `;
	if (timeDiff.years > 0) {
		result += `${timeDiff.years} yr: ${timeDiff.months} mo: ${timeDiff.days} days`;
	} else if (timeDiff.months > 0) {
		result += `${timeDiff.months} mo: ${timeDiff.days} days: ${timeDiff.hours} hr`;
	} else if (timeDiff.days > 0) {
		result += `${timeDiff.days} days: ${timeDiff.hours} hr: ${timeDiff.minutes} min`;
	} else {
		result += `${timeDiff.hours} hr: ${timeDiff.minutes} min: ${timeDiff.seconds} sec`;
	}
	return result;
}
