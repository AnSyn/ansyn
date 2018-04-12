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
	}
}
