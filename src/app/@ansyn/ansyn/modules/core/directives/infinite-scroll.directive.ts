
import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
	selector: '[ansynInfiniteScroll]'

})
export class InfiniteScrollDirective {
	@Output() private ansynInfiniteScroll = new EventEmitter();
	@HostListener('scroll', ['$event'])
	scroll($event) {
		if (Math.round($event.target.scrollTop + $event.target.clientHeight) >= $event.target.scrollHeight) {
			this.ansynInfiniteScroll.emit();
		}
	}

}
