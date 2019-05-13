import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'showFirst',
	pure: false
})
export class ShowFirstPipe implements PipeTransform {

	transform(value: any[], showFirst: boolean): any {
		if (showFirst) {
			return value.filter(component => component.prototype.showFirst && component.prototype.showFirst());
		} else {
			return value.filter(component => component.prototype.showFirst === undefined);
		}
	}

}
