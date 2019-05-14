import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';

@Directive({
	selector: '[ansynClickOutside]'
})
@AutoSubscriptions()
export class ClickOutsideDirective implements OnInit, OnDestroy {
	@Output() ansynClickOutside = new EventEmitter();
	@Input() trigger: any;
	@Input() clickEventType: string | string[] = 'click';

	@AutoSubscription
	$event: () => any = () => {
		let eventSource$: Observable<any> = this.clickEventType instanceof Array ?
			merge(...this.clickEventType.map(clickEventType => fromEvent(window, clickEventType))) :
			fromEvent(window, this.clickEventType);
		return eventSource$.pipe(
			tap(($event: any) => {
				setTimeout(() => {
					const self = $event.path.includes(this.elementRef.nativeElement);
					const trigger = $event.path.includes(this.trigger);
					if (!self && !trigger) {
						this.ansynClickOutside.emit($event);
					}
				}, 0);

			})
		);
	};

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	constructor(public elementRef: ElementRef) {
	}

}
