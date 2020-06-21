export const ContextConfig = 'contextConfig';

export enum ContextName {
	AreaAnalysis = 'areaAnalysis',
	QuickSearch = 'QuickSearch'
}

export const RequiredContextParams = {
	[ContextName.AreaAnalysis]: ['geometry'],
	[ContextName.QuickSearch]: ['geometry', 'time', 'sensors']
};
