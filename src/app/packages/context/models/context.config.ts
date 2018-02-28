import { IContextConfig } from '@ansyn/context/models/context.model';
import { InjectionToken } from '@angular/core';

export const ContextConfig: InjectionToken<IContextConfig> = new InjectionToken('ContextConfig');
