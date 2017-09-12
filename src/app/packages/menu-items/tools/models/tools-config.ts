import { CoordinatesSystem } from '@ansyn/core/utils/covert-projections';
import { InjectionToken } from '@angular/core';

export const toolsConfig: InjectionToken<IToolsConfig> = new InjectionToken('toolsConfig');

export interface IToolsConfig {
	GoTo: {
		from: CoordinatesSystem;
		to: CoordinatesSystem;
	}
}

