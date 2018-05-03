import { Inject, Pipe, PipeTransform } from '@angular/core';
import { IFiltersConfig } from '@ansyn/menu-items/filters/models/filters-config';
import { filtersConfig } from '@ansyn/menu-items/filters/services/filters.service';

@Pipe({
	name: 'showMore'
})
export class ShowMorePipe implements PipeTransform {

	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {

	}

	transform(value: any, args?: any): any {
		return args ? value : value.slice(0, this.config.shortFilterListLength);
	}

}
