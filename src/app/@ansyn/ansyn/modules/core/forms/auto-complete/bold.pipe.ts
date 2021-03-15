import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'bold'
})
export class BoldPipe implements PipeTransform {

	constructor(private sanitizer: DomSanitizer) {
	}
	transform(option: string, Value: string): unknown {
		const value = Value?.toLowerCase();
		const beginIndex = value ? option.toLowerCase().indexOf(value) : -1;
		if (beginIndex > -1) {
			const until = option.substring(0, beginIndex);
			const bold = option.substring(beginIndex, beginIndex + value.length);
			const from = option.substring(beginIndex + value.length);
			return this.sanitizer.bypassSecurityTrustHtml(`${ until }<strong>${ bold }</strong>${ from }`.replace(/ /g, "&nbsp;"));
		}
		return option;
	}

}
