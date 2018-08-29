import { Pipe, PipeTransform } from '@angular/core';

export interface IKeyVal {
	key: string;
	value: {
		count: number;
		isChecked: boolean;
	};
}


@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {

	transform(array: Array<IKeyVal>, args?: any[]): Array<IKeyVal> {
		array.sort((a: IKeyVal, b: IKeyVal) => {
			return b.value.count - a.value.count;
		});
		return array;
	}
}

