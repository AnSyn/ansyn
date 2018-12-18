import { ValueProvider } from '@angular/core';
import { mergeWith, isArray } from 'lodash';

export const getProviders = (conf): any[] => Object.entries(conf).map(([key, value]): ValueProvider => ({
	provide: key,
	useValue: value
}));

export const fetchConfigProviders = (configPath = 'assets/config/app.config.json', mergeChanges = null) => fetch(configPath)
	.then(response => response.json())
	.then(jsonConfig => mergeWith(jsonConfig, mergeChanges, mergeConfig))
	.then(getProviders);

export const mergeConfig = (changeInConfig, mergeChanges) => {
	if (isArray(mergeChanges)) {
		return mergeChanges
	}
}
