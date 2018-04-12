import enLocale from 'd3-time-format/locale/en-US.json';

export interface EventDropConfiguration {
	locale?: Object,
	metaballs?: {
		blurDeviation?: number,
		colorMatrix?: string,
	},
	bound?: {
		format?: Object,
		location?: string
	},
	axis?: {
		formats?: {
			milliseconds?: string,
			seconds?: string,
			minutes?: string,
			hours?: string,
			days?: string,
			weeks?: string,
			months?: string,
			year?: string,
		},
	},
	drop?: {
		color?: string,
		radius?: number,
		date?: Function,
		onClick?: Function,
		onMouseOver?: Function,
		onMouseOut?: Function,
		onDblClick?: Function,
		dropId?: Function,
		filterOverlap?: boolean
	},
	label?: {
		padding?: number,
		text?: any,
		width?: number,
	},
	line?: {
		color?: Function,
		height?: number,
	},
	margin?: {
		top?: number,
		right?: number,
		bottom?: number,
		left?: number,
	},
	range?: {
		start?: Date
		end?: Date,
	},
	zoom?: {
		onZoomStart?: Function,
		onZoom?: Function,
		onZoomEnd?: Function,
		minimumScale?: number,
		maximumScale?: number,
	},
	highlight?: boolean,
	d3: Object
}


export default d3 => ({
	locale: enLocale,
	metaballs: {
		blurDeviation: 10,
		colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10'
	},
	bound: {
		format: d3.timeFormat('%d %B %Y'),
		location: null
	},
	axis: {
		formats: {
			milliseconds: '%L',
			seconds: ':%S',
			minutes: '%I:%M',
			hours: '%I %p',
			days: '%a %d',
			weeks: '%b %d',
			months: '%B',
			year: '%Y'
		}
	},
	drop: {
		color: null,
		radius: 5,
		date: d => new Date(d),
		onClick: () => {
		},
		onMouseOver: () => {
		},
		onMouseOut: () => {
		},
		ondblclick: () => {
		},
		dropId: () => {
		},
		filterOverlap: true
	},
	label: {
		padding: 20,
		text: d => `${d.name} (${d.data.length})`,
		width: 200
	},
	line: {
		color: (_, index) => d3.schemeCategory10[index],
		height: 40
	},
	margin: {
		top: 20,
		right: 10,
		bottom: 20,
		left: 10
	},
	range: {
		start: new Date(new Date().getTime() - 3600000 * 24 * 365), // one year ago
		end: new Date()
	},
	zoom: {
		onZoomStart: null,
		onZoom: null,
		onZoomEnd: null,
		minimumScale: 0,
		maximumScale: Infinity
	},
	highlight: true
});
