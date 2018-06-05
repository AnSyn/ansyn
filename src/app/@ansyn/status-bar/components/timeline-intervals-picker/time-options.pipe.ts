import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'timeOptions'
})
export class TimeOptionsPipe implements PipeTransform {

	transform(value: any, args?: any): any {
		const index = value.findIndex(({ value }) => value === Number(args));
		return value.slice(index + 1, value.length);
	}

}
