import { EnumFilterMetadata } from './enum-filter-metadata';

describe('EnumFilterMetadata', () => {
	let enumFilterMetadata: EnumFilterMetadata;

	beforeEach(() => {
		enumFilterMetadata = new EnumFilterMetadata();
	});

	it('should be defined', () => {
		expect(enumFilterMetadata).toBeDefined();
	});

	describe('updateMetadata', () => {

		it('update metadata shuold flip the value of the field', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('thirdFeild');

			expect(enumFilterMetadata.enumsFields.get('firstFeild').isChecked).toBeFalsy();
			expect(enumFilterMetadata.enumsFields.get('secondFeild').isChecked).toBeFalsy();
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').isChecked).toBeTruthy();

			expect(enumFilterMetadata.enumsFields.get('firstFeild').count).toBe(1);
			expect(enumFilterMetadata.enumsFields.get('secondFeild').count).toBe(2);
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').count).toBe(3);
		});

		it('update metadata with onknown field shuold do nothing', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('lady gaga');

			expect(enumFilterMetadata.enumsFields.get('firstFeild').isChecked).toBeFalsy();
			expect(enumFilterMetadata.enumsFields.get('secondFeild').isChecked).toBeFalsy();
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').isChecked).toBeFalsy();

			expect(enumFilterMetadata.enumsFields.get('firstFeild').count).toBe(1);
			expect(enumFilterMetadata.enumsFields.get('secondFeild').count).toBe(2);
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').count).toBe(3);
		});
	});

	describe('selectOnly', () => {

		it('select only with none selected should select only one field', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.selectOnly('firstFeild');

			expect(enumFilterMetadata.enumsFields.get('firstFeild').isChecked).toBeTruthy();
			expect(enumFilterMetadata.enumsFields.get('secondFeild').isChecked).toBeFalsy();
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').isChecked).toBeFalsy();

			expect(enumFilterMetadata.enumsFields.get('firstFeild').count).toBe(1);
			expect(enumFilterMetadata.enumsFields.get('secondFeild').count).toBe(2);
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').count).toBe(3);
		});

		it('select only with all selected should select only one field', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');
			enumFilterMetadata.updateMetadata('secondFeild');
			enumFilterMetadata.updateMetadata('thirdFeild');

			enumFilterMetadata.selectOnly('firstFeild');

			expect(enumFilterMetadata.enumsFields.get('firstFeild').isChecked).toBeTruthy();
			expect(enumFilterMetadata.enumsFields.get('secondFeild').isChecked).toBeFalsy();
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').isChecked).toBeFalsy();

			expect(enumFilterMetadata.enumsFields.get('firstFeild').count).toBe(1);
			expect(enumFilterMetadata.enumsFields.get('secondFeild').count).toBe(2);
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').count).toBe(3);
		});

	});

	describe('accumulateData', () => {

		it('accumulateData should count the fields and set false in the checked attribute', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			expect(enumFilterMetadata.enumsFields.get('firstFeild').isChecked).toBeFalsy();
			expect(enumFilterMetadata.enumsFields.get('secondFeild').isChecked).toBeFalsy();
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').isChecked).toBeFalsy();

			expect(enumFilterMetadata.enumsFields.get('firstFeild').count).toBe(1);
			expect(enumFilterMetadata.enumsFields.get('secondFeild').count).toBe(2);
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').count).toBe(3);
		});

	});

	describe('initializeFilter', () => {
		it('initializeFilter should select the initialized fields', () => {
			enumFilterMetadata.initializeFilter(['firstFeild', 'secondFeild']);

			expect(enumFilterMetadata.enumsFields.get('firstFeild').isChecked).toBeTruthy();
			expect(enumFilterMetadata.enumsFields.get('secondFeild').isChecked).toBeTruthy();
			expect(enumFilterMetadata.enumsFields.get('thirdFeild')).toBeUndefined();
		});
	});


	describe('filterFunc', () => {
		it('filterFunc with selected value should return true', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');
			const overlay: any = { value: 'firstFeild' };

			const result: boolean = enumFilterMetadata.filterFunc(overlay, 'value');

			expect(result).toBeTruthy();
		});

		it('filterFunc with unselected value should return false', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');
			const overlay: any = { value: 'secondFeild' };

			const result: boolean = enumFilterMetadata.filterFunc(overlay, 'value');

			expect(result).toBeFalsy();
		});

		it('filterFunc with unknown value should return false', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');
			const overlay: any = { value: 'fourthFeild' };

			const result: boolean = enumFilterMetadata.filterFunc(overlay, 'value');

			expect(result).toBeFalsy();
		});
	});

	describe('getMetadataForOuterState', () => {

		it('getMetadataForOuterState with two selected values should return those values in an array', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');
			enumFilterMetadata.updateMetadata('secondFeild');

			const result: any = enumFilterMetadata.getMetadataForOuterState();

			expect(result).toEqual(['firstFeild', 'secondFeild']);
		});

		it('getMetadataForOuterState with selected value should return this value in an array', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');

			const result: any = enumFilterMetadata.getMetadataForOuterState();

			expect(result).toEqual(['firstFeild']);
		});

		it('getMetadataForOuterState with none selected values should return an empty array', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			const result: any = enumFilterMetadata.getMetadataForOuterState();

			expect(result).toEqual([]);
		});
	});

	describe('isFiltered', () => {
		it('isFiltered should return true if one value are selected', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');

			const result: any = enumFilterMetadata.isFiltered();

			expect(result).toBeTruthy();
		});

		it('isFiltered should return true if two value are selected', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');
			enumFilterMetadata.updateMetadata('secondFeild');

			const result: any = enumFilterMetadata.isFiltered();

			expect(result).toBeTruthy();
		});

		it('isFiltered should return true if no values are selected', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			const result: any = enumFilterMetadata.isFiltered();

			expect(result).toBeTruthy();
		});
	});

	describe('showAll', () => {
		it('showAll with none selected should select all', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			const result: any = enumFilterMetadata.showAll();

			expect(enumFilterMetadata.enumsFields.get('firstFeild').isChecked).toBeTruthy();
			expect(enumFilterMetadata.enumsFields.get('secondFeild').isChecked).toBeTruthy();
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').isChecked).toBeTruthy();
		});

		it('showAll with one selected should select all', () => {
			enumFilterMetadata.accumulateData('firstFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('secondFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');
			enumFilterMetadata.accumulateData('thirdFeild');

			enumFilterMetadata.updateMetadata('firstFeild');
			const result: any = enumFilterMetadata.showAll();

			expect(enumFilterMetadata.enumsFields.get('firstFeild').isChecked).toBeTruthy();
			expect(enumFilterMetadata.enumsFields.get('secondFeild').isChecked).toBeTruthy();
			expect(enumFilterMetadata.enumsFields.get('thirdFeild').isChecked).toBeTruthy();
		});
	});
});
