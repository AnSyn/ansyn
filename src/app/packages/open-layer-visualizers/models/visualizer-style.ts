interface Fill {
	color: string;
}

interface Stroke {
	color?: any;
	width?: any;
}

export interface VisualizerStyle {
	zIndex?: number;
	fill?: Fill;
	stroke?: Stroke;
	shadow?: Stroke;
	point?: {
		radius: number;
	};
	line?: {
		width: number;
	};
	icon?: {
		scale: number;
		src: string;
	};
	geometry?: any;
	label?: {
		font?: string,
		fill?: Fill;
		stroke?: Stroke,
		offsetX?: number;
		offsetY?: number;
		text?: string
	}
}
