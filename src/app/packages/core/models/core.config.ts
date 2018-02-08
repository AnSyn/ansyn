import { InjectionToken } from '@angular/core';
import { ICoreConfig } from './core.config.model';

export const CoreConfig: InjectionToken<ICoreConfig> = new InjectionToken('coreConfig');

