export interface IFill {
	color: string;
}

export interface IStroke {
	color?: any;
	width?: any;
}

export interface IVisualizerStyle {
	zIndex?: number;
	fill?: IFill;
	stroke?: IStroke;
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
	label?: {
		font?: string,
		fill?: IFill;
		stroke?: IStroke,
		offsetX?: number;
		offsetY?: number;
		text?: (feature: any) => string | string;
	}
}
