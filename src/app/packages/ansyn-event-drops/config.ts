import { timeDay, timeFormat, timeHour, timeMinute, timeMonth, timeSecond, timeWeek, timeYear } from 'd3';

const config = {
	dateFormat: null,
	lineHeight: 40,
	start: new Date(0),
	end: new Date(),
	minScale: 0,
	maxScale: Infinity,
	margin: {
		top: 60,
		left: 200,
		bottom: 40,
		right: 50
	},
	displayLabels: true,
	labelsWidth: 210,
	labelsRightMargin: 10,
	locale: null,
	axisFormat: null,
	tickFormat: date => {
		const formatMillisecond = timeFormat('.%L');
		const formatSecond = timeFormat(':%S');
		const formatMinute = timeFormat('%I:%M');
		const formatHour = timeFormat('%I %p');
		const formatDay = timeFormat('%a %d');
		const formatWeek = timeFormat('%b %d');
		const formatMonth = timeFormat('%B');
		const formatYear = timeFormat('%Y');

		return (timeSecond(date) < date
			? formatMillisecond
			: timeMinute(date) < date
				? formatSecond
				: timeHour(date) < date
					? formatMinute
					: timeDay(date) < date
						? formatHour
						: timeMonth(date) < date
							? timeWeek(date) < date
								? formatDay
								: formatWeek
							: timeYear(date) < date
								? formatMonth
								: formatYear)(date);
	},
	mouseout: () => {
	},
	mouseover: () => {
	},
	zoomend: () => {
	},
	zoomStreamCallback: () => {
	},
	click: () => {
	},
	dblclick: () => {
	},
	hasDelimiter: true,
	date: d => d,
	hasTopAxis: true,
	hasBottomAxis: d => d.length >= 10,
	eventLineColor: 'black',
	eventColor: null,
	metaballs: true,
	highlights: true,
	zoomable: true,
	shapes: {
		trunk: {
			path: 'M17.9419 11.7129C17.8283 11.3107 17.5785 11.0078 17.1919 10.8047L13.8395 9.00004 17.1919 7.19532C17.5785 6.99218 17.8285 6.68955 17.9419 6.28713 18.0552 5.88476 18.0028 5.50389 17.7842 5.14457L16.9777 3.85555C16.7593 3.49611 16.4339 3.26371 16.001 3.15822 15.5683 3.05294 15.1591 3.10174 14.7723 3.305L11.42 5.09778 11.42 1.50008C11.42 1.09376 11.2601 0.742198 10.9408 0.44531 10.6216 0.148423 10.2434 0 9.80659 0L8.19361 0C7.7566 0 7.37856 0.148546 7.05927 0.44531 6.74003 0.742157 6.58033 1.09376 6.58033 1.50008L6.58033 5.09778 3.2279 3.30488C2.84135 3.10162 2.43175 3.05265 1.9991 3.1581 1.56637 3.26371 1.24077 3.49599 1.02231 3.85543L0.215779 5.14449C-0.00281576 5.50381-0.0552573 5.88467 0.0581454 6.28705 0.171769 6.68934 0.421529 6.99214 0.808087 7.19524L4.16051 9.00012 0.808087 10.8048C0.421529 11.0079 0.171592 11.3106 0.0581454 11.713 -0.0552132 12.1153-0.00263918 12.496 0.215779 12.8553L1.02236 14.1445C1.24073 14.5041 1.56619 14.7364 1.99906 14.8421 2.43188 14.9472 2.8413 14.8985 3.22786 14.6951L6.58028 12.9022 6.58028 16.5001C6.58028 16.9061 6.73995 17.258 7.05923 17.5547 7.37851 17.8517 7.75669 18 8.19357 18L9.80654 18C10.2434 18 10.6217 17.8517 10.9407 17.5547 11.2602 17.258 11.4199 16.906 11.4199 16.5001L11.4199 12.9025 14.7722 14.6954C15.159 14.8985 15.5682 14.9476 16.0009 14.8421 16.4337 14.7364 16.7592 14.5043 16.9776 14.1447L17.7842 12.8556C18.0028 12.496 18.0552 12.1152 17.9419 11.7129Z',
			fill: 'green',
			offsetY: 20
		}
	}
};

config.dateFormat = config.locale
	? config.locale.timeFormat('%d %B %Y')
	: timeFormat('%d %B %Y');

export default config;
