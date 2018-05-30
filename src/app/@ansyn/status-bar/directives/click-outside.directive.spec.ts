import { ClickOutsideDirective } from './click-outside.directive';
import { ElementRef } from '@angular/core';

describe('ClickOutsideDirective', () => {
	it('should create an instance', () => {
		const fakeElementRef: ElementRef = <any> { nativeElement: {} };
		const directive = new ClickOutsideDirective(fakeElementRef);
		expect(directive).toBeTruthy();
	});
});
