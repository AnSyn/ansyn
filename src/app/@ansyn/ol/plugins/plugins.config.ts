import { IKeyValuePair } from './annotations/annotations-context-menu/models/key-value.interface';

export const OL_PLUGINS_CONFIG = 'olPluginsConfig';

export interface IOLPluginsConfig {
	Annotations: {
		displayId: '0' | '1';
	},
	AnnotationsContextMenu: {
		metadataActive: boolean;
		metadataAttributes: IConfigAttribute[];
	}
}

export interface IConfigAttribute {
	key: string;
	label: string;
	type: string;
	options: IKeyValuePair<string>[];
}
