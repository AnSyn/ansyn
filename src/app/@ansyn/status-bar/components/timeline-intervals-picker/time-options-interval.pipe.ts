import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'timeOptionsInterval'
})
export class TimeOptionsIntervalPipe implements PipeTransform {

	transform(value: any, args?: any): any {
		const index = value.findIndex(({ value }) => value === Number(args));
		return value.splice(0, index);
	}

}
