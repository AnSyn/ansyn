import { deepMerge } from './deep-merge';

describe('deepmerge function', () => {
	let obj1, obj2;

	beforeEach(() => {
		obj1 = {
			'temp': 'temp',
			'arr': [1, 2],
			'arr2': [1, 2],
			'obj': {
				'value1': 'value1',
				'value2': 'value2'
			}
		};
		obj2 = {
			'temp': 'temp',
			'arr': [1],
			'obj': {
				'value1': 'value',
				'value3': 'value3'
			}
		};
	});

	it('check deep merge with merge', () => {
		const obj3 = deepMerge(obj1, obj2, 'merge');
		expect(obj3.obj.value2).toBe('value2');
		expect(obj3.arr2).toEqual([1, 2]);
		expect(obj3.arr).toEqual([1]);
		expect(obj3.obj.value3).toBe('value3');
		expect(obj1.obj.value3).toBe(undefined);
	});

	it('check deep merge with set', () => {
		const obj3 = deepMerge(obj1, obj2, 'set');
		expect(obj3.obj.value2).toBe(undefined);
		expect(obj3.arr2).toEqual([]);
		expect(obj3.arr).toEqual([1]);
		expect(obj3.obj.value3).toBe('value3');
		expect(obj1.obj.value3).toBe(undefined);
	});
});
