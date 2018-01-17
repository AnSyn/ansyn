export interface Filter {
	modelName: string;
	displayName: string;
	type: 'Enum' | 'Slider' | 'Boolean';
	customData: any;
}
