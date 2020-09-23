import { buildFilteredOverlays } from './overlays';

describe('Overlays utils', () => {
	describe('buildFilteredOverlays()', () => {

		it('buildFilteredOverlays should build filtered overlays', () => {

			let o1 = { id: '1', date: new Date(0) },
				o2 = { id: '2', date: new Date(1) },
				parsedFilters = [{ key: 'fakeFilter', filterFunc: ({ id }) => id !== '1' }],
				overlays = <any>[o1, o2]

			let ids = buildFilteredOverlays(overlays, parsedFilters);
			expect(ids).toEqual(['2']);

		});

	})
});
