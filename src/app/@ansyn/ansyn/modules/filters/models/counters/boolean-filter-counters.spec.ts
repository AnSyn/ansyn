import { BooleanFilterCounters } from './boolean-filter-counters';

describe('EnumFilterMetadata', () => {
	let booleanFilterCounters: BooleanFilterCounters;

	beforeEach(() => {
		booleanFilterCounters = new BooleanFilterCounters();
	});

	it('should be defined', () => {
		expect(booleanFilterCounters).toBeDefined();
	});

});
