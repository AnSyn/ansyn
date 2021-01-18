import { InjectionToken } from '@angular/core';

export const COMPONENT_MODE: InjectionToken<boolean> = new InjectionToken<boolean>('COMPONENT_MODE');

export const COMPONENT_VISIBILITY = 'componentVisibility';

export interface IComponentVisiblity {
	timeline: boolean,
	resultTable: boolean,
	help: boolean,
	credentials: boolean,
	export: boolean,
	annotations: boolean,
	goTo: boolean,
	measures: boolean,
	shadowMouse: boolean,
	screens: boolean,
	layers: boolean,
	favorites: boolean,
	cases: boolean,
	overlaySearch: boolean,
	search: boolean,
	footprints: boolean,
	imageProcessing: boolean
}

export enum ComponentVisibilityItems {
	TIMELINE = 'timeline',
	RESULT_TABLE = 'resultTable',
	HELP= 'help',
	CREDENTIALS= 'credentials',
	EXPORT= 'export',
	ANNOTATIONS= 'annotations',
	GOTO= 'goTo',
	MEASURES= 'measures',
	SHADOW_MOUSE= 'shadowMouse',
	SCREENS= 'screens',
	LAYERS= 'layers',
	FAVORITES= 'favorites',
	CASES= 'cases',
	OVERLAY_SEARCH= 'overlaySearch',
	SEARCH= 'search',
	FOOTPRINTS= 'footprints',
	IMAGE_PROCESSING= 'imageProcessing'

}
