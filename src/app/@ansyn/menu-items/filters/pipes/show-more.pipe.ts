import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'showMore'
})
export class ShowMorePipe implements PipeTransform {

	transform(value: any, args?: any): any {
		return value.slice(0, 5);
	}

}
