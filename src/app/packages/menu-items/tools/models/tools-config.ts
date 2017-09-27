import { CoordinatesSystem } from '@ansyn/core/utils/covert-projections';
import { InjectionToken } from '@angular/core';

export interface IToolsConfig {
	GoTo: {
		from: CoordinatesSystem;
		to: CoordinatesSystem;
	}
}

export const toolsConfig: InjectionToken<IToolsConfig> = new InjectionToken('toolsConfig');



