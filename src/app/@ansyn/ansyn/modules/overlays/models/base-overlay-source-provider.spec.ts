import { timeIntersection } from './base-overlay-source-provider.model';

describe('BaseOverlaySourceProvider', () => {
	describe('timeIntersection', () => {
		const range2015 = {
			start: new Date('2015-01-01'),
			end: new Date('2015-12-31')
		};

		const rangeHalf15Half16 = {
			start: new Date('2015-06-01'),
			end: new Date('2016-05-31')
		};


		const range2016 = {
			start: new Date('2016-01-01'),
			end: new Date('2016-12-31')
		};

		const rangeAlways = {
			start: null,
			end: null
		};

		const tests = [
			{
				title: 'should return full intersection',
				ranges: [range2016, rangeAlways],
				expect: range2016
			}, {
				title: 'should have no intersection',
				ranges: [range2015, range2016],
				expect: null
			}, {
				title: 'should have partial intersection 2015',
				ranges: [range2015, rangeHalf15Half16],
				expect: {
					start: rangeHalf15Half16.start,
					end: range2015.end
				}
			}, {
				title: 'should have partial intersection 2016',
				ranges: [rangeHalf15Half16, range2016],
				expect: {
					start: range2016.start,
					end: rangeHalf15Half16.end
				}
			}
		];

		tests.forEach(test => {
			for (let i = 0; i < 2; i++) {
				it(test.title + ' direction ' + i, () => {
					const intersection = timeIntersection(test.ranges[i % 2], test.ranges[(i + 1) % 2]);

					if (test.expect) {
						expect(intersection.start).toBe(test.expect.start);
						expect(intersection.end).toBe(test.expect.end);
					} else {
						expect(intersection).toBeNull();
					}
				});
			}
		});

	});
});
