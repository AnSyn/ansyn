import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ComboBoxComponent } from '../combo-box/combo-box.component';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { NgControl } from '@angular/forms';

@Component({
	selector: 'ansyn-combo-box-option',
	templateUrl: './combo-box-option.component.html',
	styleUrls: ['./combo-box-option.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ComboBoxOptionComponent implements OnInit, OnDestroy {
	@Input() value;
	@HostBinding('class.disabled')
	@Input() disabled: boolean;

	@AutoSubscription
	selectedChanged$ = this._parent.injector.get(NgControl).valueChanges.pipe(tap(selected => {
		if (selected === this.value) {
			this._parent.renderSelected = this.el.nativeElement.outerHTML;
		}
	}));

	@HostListener('click') onClick() {
		this._parent.selectOption(this.value);
	}

	get selected() {
		return this._parent.selected;
	}

	constructor(protected _parent: ComboBoxComponent, protected el: ElementRef) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

}
