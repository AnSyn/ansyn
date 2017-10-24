export interface VisualizerStyle {
	zIndex?: number;
	fill?: {
		color: string;
	};
	stroke?: {
		color?: string;
		width?: number;
	};
	point?: {
		radius: number;
	};
	line?: {
		width: number;
	};
	icon?: {
		scale: number;
		src: string;
	}
}
