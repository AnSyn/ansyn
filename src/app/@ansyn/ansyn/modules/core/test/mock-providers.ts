export function mockIndexProviders(providersName: string[]) {
	const indexProviders = providersName.reduce((providers, provideName) => {
		return {
			...providers,
			[provideName]: {
				dataInputFiltersConfig: {
					text: provideName,
					value: provideName
				}
			}
		}
	}, {});
	return indexProviders;
}
