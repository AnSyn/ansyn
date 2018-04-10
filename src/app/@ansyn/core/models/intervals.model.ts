import { Overlay } from '@ansyn/core';

export interface IntervalTimeFrame {
	startDate: Date;
	endDate: Date;
	span: number;
	intervalsCount: number;
}

export interface IntervalTimeFrame {
	startDate: Date;
	endDate: Date;
	span: number;
	intervalsCount: number;
}

export interface Interval {
	startTime: Date;
	endTime: Date;
	pivot: Date;
	overlays: Array<Overlay>;
}
