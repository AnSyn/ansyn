import { IMenuItem } from '../models/menu-item.model';
import { InjectionToken } from '@angular/core';

export const MENU_ITEMS = new InjectionToken<IMenuItem[]>('MENU_ITEMS');
