export interface ICoreConfig {
	alerts: {
		[key: string]: {
			background: string;
			text: string;
		}
	},
	colors: {
		active: string,
		inactive: string
	}
}
