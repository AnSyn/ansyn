import { InjectionToken } from '@angular/core';
import { CoordinatesSystem } from '@ansyn/core';

export interface IToolsConfig {
	GoTo: {
		from: CoordinatesSystem;
		to: CoordinatesSystem;
	},
	Proj4: {
		ed50: string;
		ed5036: string;
	}
}

export const toolsConfig: InjectionToken<IToolsConfig> = new InjectionToken('toolsConfig');



