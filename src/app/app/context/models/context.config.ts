import { LayoutKey } from '@ansyn/map-facade';

export const ContextConfig = 'contextConfig';

export interface IContextConfig {
	TwoMaps: II2MapsContext
}

export enum ContextName {
	AreaAnalysis = 'areaAnalysis',
	QuickSearch = 'QuickSearch',
	ImisightMission = 'ImisightMission',
	TwoMaps = 'TwoMaps',
	GeoAndTime = 'GeoAndTime'
}

export const RequiredContextParams = {
	[ContextName.AreaAnalysis]: ['geometry'],
	[ContextName.QuickSearch]: ['geometry', 'time', 'sensors'],
	[ContextName.TwoMaps]: ['geometry'],
	[ContextName.ImisightMission]: ['geometry', 'accessToken', 'idToken', 'expiresIn'],
	[ContextName.GeoAndTime]: ['geometry', 'time']
};

export interface II2MapsContext {
	layout: LayoutKey,
	sensors: string[]
}
