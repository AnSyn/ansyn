import { SliderFilterCounters } from './slider-filter-counters';

describe('SliderFilterMetadata', () => {
	let sliderFilterCounters: SliderFilterCounters;

	beforeEach(() => {
		sliderFilterCounters = new SliderFilterCounters();
	});

	it('should be defined', () => {
		expect(sliderFilterCounters).toBeDefined();
	});
});
