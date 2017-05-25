import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IMenuState } from '@ansyn/menu/reducers/menu.reducer';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';

export interface IAppState {
	overlays: IOverlayState;
	cases: ICasesState;
	menu: IMenuState;
	layers: ILayerState;
}
