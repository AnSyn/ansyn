import { IMAGERY_CONFIG } from '../model/configuration.token';
import { IImageryConfig } from '../model/iimagery-config';
import { ValueProvider } from '@angular/core';

export function createConfig(config: IImageryConfig): ValueProvider {
	return {
		provide: IMAGERY_CONFIG,
		useValue: config
	};
}
