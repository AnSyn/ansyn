import { IContextConfig } from './context.config.model';
import { InjectionToken } from '@angular/core';

export const ContextConfig: InjectionToken<IContextConfig> = new InjectionToken('ContextConfig');
