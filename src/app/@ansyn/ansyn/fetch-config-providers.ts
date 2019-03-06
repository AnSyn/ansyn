import { ValueProvider } from '@angular/core';
import { mergeWith } from 'lodash';
import { IConfigModel } from './config.model';

export const getProviders = (conf): any[] => Object.entries(conf).map(([key, value]): ValueProvider => ({
	provide: key,
	useValue: value
}));

// mergeWith doesn't run over the array without this customizer
export const mergeConfig = (sectionInConfig, mergeChanges) => {
	if (Array.isArray(sectionInConfig)) {
		return mergeChanges
	}
};

export const fetchConfigProviders = (configPath = 'assets/config/app.config.json', mergeChanges: IConfigModel | any = null) => fetch(configPath)
	.then(response => response.json())
	.then(jsonConfig => mergeWith(jsonConfig, mergeChanges, mergeConfig))
	.then(getProviders);

