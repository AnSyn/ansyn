import { EnumFilterCounters } from './enum-filter-counters';

describe('EnumFilterMetadata', () => {
	let enumFilterCounters: EnumFilterCounters;

	beforeEach(() => {
		enumFilterCounters = new EnumFilterCounters();
	});

	it('should be defined', () => {
		expect(enumFilterCounters).toBeDefined();
	});
});
