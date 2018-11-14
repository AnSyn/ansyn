import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, takeUntil, takeWhile, tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-modal',
	templateUrl: './ansyn-modal.component.html',
	styleUrls: ['./ansyn-modal.component.less']
})
export class AnsynModalComponent {
	protected _show: boolean;

	escPressed$ = fromEvent(window, 'keydown').pipe(
		takeWhile(() => this.show),
		filter(($event: KeyboardEvent) => $event.keyCode === 27),
		tap(() => this.show = false));

	@HostBinding('class.show')
	@Input()
	set show(value) {
		if (this.show !== value) {
			this._show = value;
			this.showChange.emit(value);
		}
		if (value) {
			this.escPressed$.subscribe();
		}
	}

	get show() {
		return this._show;
	}

	@Output() showChange = new EventEmitter<boolean>();

	close() {
		this.show = false;
	}
}
