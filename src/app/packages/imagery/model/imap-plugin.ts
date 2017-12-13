export interface IMapPlugin {
	pluginType: string;
	isEnabled: boolean;

	init(mapId: string);

	dispose();
}
