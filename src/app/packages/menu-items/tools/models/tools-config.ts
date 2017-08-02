import { CoordinatesSystem } from '@ansyn/core/utils/covert-projections';
import { InjectionToken } from '@angular/core';

export interface ToolsConfig  {
	GoTo: {
		from: CoordinatesSystem;
		to: CoordinatesSystem;
	}
}

export const toolsConfig: InjectionToken<ToolsConfig> = new InjectionToken('toolsConfig');
