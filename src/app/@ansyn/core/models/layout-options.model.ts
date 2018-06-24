import { MapsLayout } from '@ansyn/core/models/maps-layout';

export type LayoutKey = 'layout1' | 'layout2' | 'layout3' | 'layout4' | 'layout5' | 'layout6';

export const layoutOptions = new Map<LayoutKey, MapsLayout>([
	['layout1', { id: 'layout1', mapsCount: 1 }],
	['layout2', { id: 'layout2', mapsCount: 2 }],
	['layout3', { id: 'layout3', mapsCount: 2 }],
	['layout4', { id: 'layout4', mapsCount: 3 }],
	['layout5', { id: 'layout5', mapsCount: 3 }],
	['layout6', { id: 'layout6', mapsCount: 4 }]
]);
