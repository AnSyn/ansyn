export const OL_PLUGINS_CONFIG = 'olPluginsConfig';

export interface IOLPluginsConfig {
	Annotations: {
		displayId: '0' | '1';
		icon?: {
			scale?: number;
			src: string;
			anchor?: number[];
		};
	}
}
