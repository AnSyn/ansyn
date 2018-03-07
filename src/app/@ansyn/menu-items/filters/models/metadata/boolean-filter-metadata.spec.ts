import { BooleanFilterMetadata } from './boolean-filter-metadata';

describe('EnumFilterMetadata', () => {
	let booleanFilterMetadata: BooleanFilterMetadata;

	beforeEach(() => {
		booleanFilterMetadata = new BooleanFilterMetadata();
	});

	it('should be defined', () => {
		expect(booleanFilterMetadata).toBeDefined();
	});

	describe('updateMetadata', () => {

		it('updateMetadata shuold update true/false properties via key', () => {
			booleanFilterMetadata.updateMetadata({ key: 'trueProperties', value: false });
			expect(booleanFilterMetadata.trueProperties.value).toBeFalsy();
		});
	});

	describe('selectOnly', () => {
		it('selectOnly should set only true/false properties values', () => {
			booleanFilterMetadata.selectOnly('falseProperties');
			expect(booleanFilterMetadata.falseProperties.value).toBeTruthy();
			expect(booleanFilterMetadata.trueProperties.value).toBeFalsy();
		});
	});

	describe('accumulateData', () => {
		it('accumulateData should count true/false values', () => {
			booleanFilterMetadata.accumulateData(true);
			booleanFilterMetadata.accumulateData(true);
			booleanFilterMetadata.accumulateData(true);
			booleanFilterMetadata.accumulateData(false);
			booleanFilterMetadata.accumulateData(false);
			expect(booleanFilterMetadata.trueProperties.count).toEqual(3);
			expect(booleanFilterMetadata.falseProperties.count).toEqual(2);
		});
	});

});
