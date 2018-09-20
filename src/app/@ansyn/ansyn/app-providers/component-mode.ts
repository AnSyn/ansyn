import { InjectionToken } from '@angular/core';
import { InjectionsContainer } from '@ansyn/core';

export const COMPONENT_MODE: InjectionToken<boolean> = InjectionsContainer.get<boolean>('COMPONENT_MODE');
