/**
 * Created by AsafMas on 06/06/2017.
 */

import { InjectionToken } from '@angular/core';
import { IImageryConfig } from './model/iimagery-config';

export const ConfigurationToken: InjectionToken<IImageryConfig> = new InjectionToken('imagery-map-component-config');
