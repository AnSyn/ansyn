import { EventEmitter } from '@angular/core';

export interface IMapPlugin {
	pluginType: string;
	isEnabled: boolean;
	onDisposedEvent: EventEmitter<any>;

	init(mapId: string);

	dispose();
}
