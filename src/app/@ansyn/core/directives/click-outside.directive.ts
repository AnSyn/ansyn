import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { fromEvent } from 'rxjs';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';

@Directive({
	selector: '[ansynClickOutside]'
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
	@Output() ansynClickOutside = new EventEmitter();
	@Input() trigger: any;
	@Input() eventListener = 'click';

	@AutoSubscription
	$event = () => {
		return fromEvent(window, this.eventListener).pipe(
		tap(($event: any) => {
			setTimeout(() => {
				const self = $event.path.includes(this.elementRef.nativeElement);
				const trigger = $event.path.includes(this.trigger);
				if (!self && !trigger) {
					this.ansynClickOutside.emit($event);
				}
			}, 0);

		})
	)};

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	constructor(public elementRef: ElementRef) {
	}

}
