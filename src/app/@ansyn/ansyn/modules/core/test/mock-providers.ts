export function mockIndexProviders(providersName: string[]) {
	const indexProviders = providersName.reduce((providers, provideName, index) => {
		return {
			...providers,
			[provideName]: {
				dataInputFiltersConfig: {
					text: provideName,
					children: [
						{
							text: `sensor${index + 1}`,
							value: {
								sensorType: `sensor${index + 1}`
							}
						}
					]
				}
			}
		}
	}, {});
	return indexProviders;
}
