import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'TableRowPipe'
})
export class TableRowPipe implements PipeTransform {

	transform(value: unknown, args: PipeTransform): unknown {
		return args ? args.transform(value) : value;
	}

}
