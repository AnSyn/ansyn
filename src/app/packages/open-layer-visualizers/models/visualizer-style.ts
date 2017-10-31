interface Fill {
	color: string;
}

interface Stroke {
	color?: string;
	width?: number;
}

export interface VisualizerStyle {
	zIndex?: number;
	fill?: Fill;
	stroke?: Stroke;
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
