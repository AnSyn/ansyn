import { InfiniteScrollDirective } from './infinite-scroll.directive';
import { ElementRef } from '@angular/core/src/linker/element_ref';

describe('InfiniteScrollDirective', () => {
	let directive: InfiniteScrollDirective;
	let elementFake: ElementRef;

	beforeEach(() => {
		elementFake = <any> {
			nativeElement: {
				addEventListener: () => {
				}
			}
		};
		spyOn(elementFake.nativeElement, 'addEventListener');
		directive = new InfiniteScrollDirective(elementFake);
	});

	it('should create an instance', () => {
		expect(directive).toBeTruthy();
		expect(elementFake.nativeElement.addEventListener).toHaveBeenCalled();
	});

	it('should check if scroll top on bottom', () => {
		let target = <any> { scrollTop: 0, clientHeight: 100, scrollHeight: 101 };
		let $event: MouseEvent = <any> { target };
		spyOn(directive.ansynInfiniteScroll, 'emit');
		directive.onScroll($event);
		// not 0 + 100 >= 101
		expect(directive.ansynInfiniteScroll.emit).not.toHaveBeenCalled();
		target.scrollHeight = 99;
		directive.onScroll($event);
		// 0 + 100 >= 99
		expect(directive.ansynInfiniteScroll.emit).toHaveBeenCalled();
	});

});
