import { ConfigurationToken } from '@ansyn/imagery/model/configuration.token';
import { IImageryConfig, initialImageryConfig } from '@ansyn/imagery/model/iimagery-config';
import { ValueProvider } from '@angular/core';
//
// export function configFactory(config?: IImageryConfig) {
// 	return config || initialImageryConfig;
// }

export function createConfig(config?: IImageryConfig): ValueProvider {
	return {
		provide: ConfigurationToken,
		useValue: config
	}
}
