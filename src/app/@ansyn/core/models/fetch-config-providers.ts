import { ValueProvider } from '@angular/core';

export const getProviders = (conf): any[] => Object.entries(conf).map(([key, value]): ValueProvider => ({
	provide: key,
	useValue: value
}));

export const fetchConfigProviders = (configPath = 'assets/config/app.config.json') => fetch(configPath)
	.then(response => response.json())
	.then(getProviders);
