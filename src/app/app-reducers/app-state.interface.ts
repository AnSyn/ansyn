import { IOverlayState } from '../packages/overlays/reducers/overlays.reducer';
import { ICasesState } from '../packages/menu-items/cases/reducers/cases.reducer';
import { IMenuState } from '../packages/menu/reducers/menu.reducer';
import { ILayerState } from '../packages/menu-items/layers-manager/reducers/layers.reducer';

export interface IAppState {
	overlays: IOverlayState;
	cases: ICasesState;
	menu: IMenuState;
	layers: ILayerState;
}
