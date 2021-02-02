import { Pipe, PipeTransform } from '@angular/core';
import { IKeyVal } from './sort.pipe';

@Pipe({ name: 'mapIterator' })
export class MapIteratorPipe implements PipeTransform {
	transform(value: any, args?: any[]): IKeyVal[] {
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
