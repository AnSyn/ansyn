import {
	Component,
	ElementRef,
	EventEmitter,
	forwardRef, Inject,
	Injectable, InjectionToken,
	Input,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { ComboBoxTriggerComponent } from '../combo-box-trigger/combo-box-trigger.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-combo-box',
	templateUrl: './combo-box.component.html',
	styleUrls: ['./combo-box.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => ComboBoxComponent),
			multi: true
		}
	]
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ComboBoxComponent implements OnInit, OnDestroy, ControlValueAccessor {
	onTouchedCallback: () => void = noop;
	onChangeCallback: (_: any) => void = noop;
	@ViewChild(ComboBoxTriggerComponent) trigger: ComboBoxTriggerComponent;
	@ViewChild('optionsContainer') optionsContainer: ElementRef;
	@Input() icon: string;
	selected: any;
	@Input() renderFunction: Function;
	@Input() toolTipField: string;
	@Input() comboBoxToolTipDescription: string;
	@Input() direction: 'top' | 'bottom' = 'bottom';
	@Input() color: 'black' | 'transparent' = 'black';

	@Input() placeholder: string;
	@Input() required: boolean;
	optionsVisible = false;

	get optionsTrigger(): ElementRef {
		return this.trigger && this.trigger.optionsTrigger;
	}

	toggleShow() {
		this.optionsVisible = !this.optionsVisible;
		if (this.optionsVisible) {
			setTimeout(() => this.optionsContainer && this.optionsContainer.nativeElement.focus(), 0);
		}
	}

	onBlurOptionsContainer($event: FocusEvent) {
		if ($event.relatedTarget !== (this.optionsTrigger && this.optionsTrigger.nativeElement)) {
			this.optionsVisible = false;
		}
	}

	selectOption(selected) {
		this.optionsVisible = false;

		if (selected !== this.selected) {
			this.selected = selected;
			this.onChangeCallback(selected);
		}
	}

	render(selected) {
		if (this.renderFunction) {
			return this.renderFunction(selected);
		}
		return selected;
	}

	registerOnChange(fn: any): void {
		this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouchedCallback = fn;
	}

	setDisabledState(isDisabled: boolean): void {
	}

	writeValue(value: any): void {
		if (value !== this.selected) {
			this.selected = value;
		}
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}
}
