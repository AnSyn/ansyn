export type FeatureField<T> = T | ((feature: any) => T);

export interface IStroke {
	stroke?: string | any;
	'stroke-width'?: number | any;
	'stroke-opacity'?: number | any;
	'stroke-dasharray'?: number | any;
}

export interface IFill {
	fill?: string | any;
	'fill-opacity'?: number | any;
}

export interface ILabel extends IStroke {
	fontSize?: number | any;
	fill?: string;
	offsetY?: FeatureField<number>; // for first use
	text?: FeatureField<string>;
	overflow?: boolean;
}

export interface IIcon {
	scale: number;
	src: string;
	anchor?: number[];
	rotation?: number;
	rotateWithView?: boolean;
}

export interface IVisualizerStyle extends IStroke, IFill {
	zIndex?: number;
	'marker-color'?: string;
	'marker-size'?: MarkerSize;
	shadow?: IStroke;
	icon?: IIcon | any;
	geometry?: any;
	circle?: number | any;
	label?: ILabel;
}

export enum MarkerSize {
	small = 'small',
	medium = 'medium',
	large = 'large'
}

export enum MarkerSizeDic {
	small = 4,
	medium = 6,
	large = 8
}
