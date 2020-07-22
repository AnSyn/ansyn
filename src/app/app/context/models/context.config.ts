export const ContextConfig = 'contextConfig';

export enum ContextName {
	AreaAnalysis = 'areaAnalysis',
	QuickSearch = 'QuickSearch',
	ImisightMission = 'ImisightMission'
}

export const RequiredContextParams = {
	[ContextName.AreaAnalysis]: ['geometry'],
	[ContextName.QuickSearch]: ['geometry', 'time', 'sensors'],
	[ContextName.ImisightMission]: ['geometry', 'accessToken', 'idToken', 'expiresIn']
};
