import { MapIteratorPipe } from './map-iterator.pipe';

describe('MapIteratorPipe', () => {

	let mapIteratorPipe: MapIteratorPipe;

	beforeEach(() => {
		mapIteratorPipe = new MapIteratorPipe();
	});

	it('transforms map to key-values', () => {
		let map: Map<string, string> = new Map<string, string>();
		map.set('1', 'one');
		map.set('2', 'two');

		expect(mapIteratorPipe.transform(map)).toEqual([{ key: '1', value: 'one' }, { key: '2', value: 'two' }]);
	});

});
