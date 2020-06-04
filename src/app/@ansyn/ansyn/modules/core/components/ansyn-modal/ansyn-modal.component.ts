import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { filter, takeWhile, tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-modal',
	templateUrl: './ansyn-modal.component.html',
	styleUrls: ['./ansyn-modal.component.less']
})
export class AnsynModalComponent {
	protected _show: boolean;

	escPressed$: Observable<any> = fromEvent(window, 'keydown').pipe(
		takeWhile(() => this.show),
		filter(($event: KeyboardEvent) => $event.keyCode === 27),
		tap(() => this.show = false));

	@Output() showChange = new EventEmitter<boolean>();

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


	close() {
		this.show = false;
	}
}
