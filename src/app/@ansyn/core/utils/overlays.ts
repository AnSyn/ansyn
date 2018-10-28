import { IOverlay } from '../models/overlay.model';
import { IFilterModel } from '../models/IFilterModel';
import { union } from 'lodash';

export function isFullOverlay(overlay: IOverlay): boolean {
	return Boolean(overlay && overlay.date);
}
