import { Component, Pipe, PipeTransform } from '@angular/core';

export type KeyVal = { key: string, value: { count: number, isChecked: boolean } };


@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {

	transform(array: Array<KeyVal>, args?: any[]): Array<KeyVal> {
		array.sort((a: KeyVal, b: KeyVal) => {
			if (a.value.count < b.value.count) {
				return 1;
			} else if (a.value.count > b.value.count) {
				return -1;
			} else {
				return 0;
			}
		});
		return array;
	}
}

