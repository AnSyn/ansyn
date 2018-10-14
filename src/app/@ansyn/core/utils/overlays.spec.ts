import { buildFilteredOverlays } from './overlays';

describe('Overlays utils', () => {
	describe('buildFilteredOverlays()', () => {

		it('buildFilteredOverlays should build filtered overlays', () => {

			let o1 = { id: '1', date: new Date(0) },
				o2 = { id: '2', date: new Date(1) },
				o3 = { id: '3', date: new Date(2) },
				parsedFilters = [{ key: 'fakeFilter', filterFunc: ({id}) => id !== '1' }],
				overlays = <any> [o1, o2, o3],
				removedLayers = <any> ['2'];

			let ids = buildFilteredOverlays(overlays, parsedFilters, removedLayers, true);
			expect(ids).toEqual(['3']);

		});

	})
});
