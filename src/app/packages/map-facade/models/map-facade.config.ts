import { InjectionToken } from '@angular/core';
import { IMapFacadeConfig } from './map-config.model';

export const mapFacadeConfig: InjectionToken<IMapFacadeConfig> = new InjectionToken('map-facade-config');
