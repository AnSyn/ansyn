export const ContextConfig = 'contextConfig';

export enum ContextName {
	AreaAnalysis = 'areaAnalysis'
}

export const RequiredContextParams = {
	[ContextName.AreaAnalysis]: ['geometry']
};
