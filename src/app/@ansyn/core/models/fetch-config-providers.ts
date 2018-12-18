import { ValueProvider } from '@angular/core';
import { mergeWith, isArray } from 'lodash';

export const getProviders = (conf): any[] => Object.entries(conf).map(([key, value]): ValueProvider => ({
	provide: key,
	useValue: value
}));

export const fetchConfigProviders = (configPath = 'assets/config/app.config.json', wantedMergeChanges = null) => fetch(configPath)
	.then(response => response.json())
	.then(jsonConfig => mergeWith(jsonConfig, wantedMergeChanges, mergeConfig))
	.then(getProviders);

export const mergeConfig = (sectionInConfig, wantedMergeChanges) => {
	if (isArray(sectionInConfig)) {
		return wantedMergeChanges
	}
}
