import { Pipe, PipeTransform } from '@angular/core';

export interface KeyVal {
	key: string;
	value: {
		count: number;
		isChecked: boolean;
	};
}


@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {

	transform(array: Array<KeyVal>, args?: any[]): Array<KeyVal> {
		array.sort((a: KeyVal, b: KeyVal) => {
			return b.value.count - a.value.count
		});
		return array;
	}
}

