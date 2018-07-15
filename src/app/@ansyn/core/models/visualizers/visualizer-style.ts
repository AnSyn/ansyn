export interface IStroke {
	stroke?: string | any;
	'stroke-width'?: number | any;
	"stroke-opacity"?: number | any;
}
export interface IFill {
	fill?: string | any;
	"fill-opacity"?: number | any;
}

export interface ILabel extends IStroke {
	font?: string,
	fill?: string;
	offsetX?: number;
	offsetY?: number;
	text?: (feature: any) => string | string;
}

export interface IVisualizerStyle extends IStroke, IFill {
	zIndex?: number;
	fill?: string;
	"fill-opacity"?: number
	shadow?: IStroke;
	point?: {
		radius: number;
	};
	line?: {
		width: number;
	};
	icon?: {
		scale: number;
		src: string;
		anchor?: number[];
	};
	geometry?: any;
	label?: ILabel;
}
