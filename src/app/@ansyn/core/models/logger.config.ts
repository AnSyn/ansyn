import { InjectionToken } from '@angular/core';
import { ILoggerConfig } from './logger-config.model';

export const LoggerConfig: InjectionToken<ILoggerConfig> = new InjectionToken('LoggerConfig');

