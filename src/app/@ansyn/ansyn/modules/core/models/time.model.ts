export type MomentTimeUnits = (
	'year' | 'years' | 'y' |
	'month' | 'months' | 'M' |
	'week' | 'weeks' | 'w' |
	'day' | 'days' | 'd' |
	'hour' | 'hours' | 'h' |
	'minute' | 'minutes' | 'm' |
	'second' | 'seconds' | 's' |
	'millisecond' | 'milliseconds' | 'ms'
	);

export interface IDeltaTime {
	unit: MomentTimeUnits;
	amount: number;
}
