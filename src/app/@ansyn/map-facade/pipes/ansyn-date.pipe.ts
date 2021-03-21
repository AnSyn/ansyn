import { Inject, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
	name: 'ansynDate'
})
export class AnsynDatePipe extends DatePipe implements PipeTransform {
	constructor(@Inject(String) locale?) {
		super(locale || 'en-US')
	}
	transform(value: any, args?: any): any {
		return super.transform(value, 'dd/MM/yyyy HH:mm:ss');
	}
}
