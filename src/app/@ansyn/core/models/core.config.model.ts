export interface ICoreConfigAlert {
	key: string;
	background: string;
	text: string;
}

export interface ICoreConfig {
	alerts: ICoreConfigAlert [];
	colors: {
		active: string,
		inactive: string
	},
	windowLayout: {
		'menu': boolean,
		'toolsOverMenu': boolean,
		'statusBar': boolean,
		'timeLine': boolean,
		'contextSun': boolean
	}
}
