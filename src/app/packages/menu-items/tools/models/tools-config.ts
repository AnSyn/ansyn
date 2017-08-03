import { CoordinatesSystem } from '@ansyn/core/utils/covert-projections';
import { InjectionToken } from '@angular/core';

export const toolsConfig: InjectionToken<ToolsConfig> = new InjectionToken('toolsConfig');

export interface ToolsConfig  {
	GoTo: {
		from: CoordinatesSystem;
		to: CoordinatesSystem;
	}
}

