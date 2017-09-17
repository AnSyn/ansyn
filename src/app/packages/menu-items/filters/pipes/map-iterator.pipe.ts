import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mapIterator' })
export class MapIteratorPipe implements PipeTransform {
	transform(value: any, args?: any[]): Object[] {
		let returnArray = [];

		value.forEach((entryVal, entryKey) => {
			returnArray.push({
				key: entryKey,
				value: entryVal
			});
		});

		return returnArray;
	}
}
