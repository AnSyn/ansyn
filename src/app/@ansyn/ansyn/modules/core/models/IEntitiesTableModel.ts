import { Dictionary } from '@ngrx/entity';
import { PipeTransform } from '@angular/core';

export interface IEntitiesTableData<T> {
	entities: Dictionary<T>
	ids: Array<string | number>
}

export interface ITableRowModel<T> {
	headName: string;
	propertyName: keyof T;
	pipe?: PipeTransform
	isIcon?: boolean;
}
