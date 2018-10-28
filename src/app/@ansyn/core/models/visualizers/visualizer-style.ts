export type FeatureField<T> = T | ((feature: any) => T);

export interface IStroke {
	stroke?: string | any;
	'stroke-width'?: number | any;
	'stroke-opacity'?: number | any;
}

export interface IFill {
	fill?: string | any;
	'fill-opacity'?: number | any;
}

export interface ILabel extends IStroke {
	font?: string,
	fill?: string;
	offsetX?: number;
	offsetY?: FeatureField<number>;
	text?: FeatureField<string>;
	overflow?: boolean;
}

export interface IVisualizerStyle extends IStroke, IFill {
	zIndex?: number;
	fill?: string;
	'fill-opacity'?: number;
	'marker-color'?: string;
	'marker-size'?: MarkerSize;
	shadow?: IStroke;
	icon?: {
		scale: number;
		src: string;
		anchor?: number[];
	};
	geometry?: any;
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
