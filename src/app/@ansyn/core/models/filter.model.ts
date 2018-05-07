import { Overlay } from '@ansyn/overlays/models/overlay.model';

export interface FilterModel {
	key: string;
	filterFunc: (ovrelay: any, key: string) => boolean;
}

export interface FavoritesModel {
	only: boolean;
	overlays: Overlay[];
}
