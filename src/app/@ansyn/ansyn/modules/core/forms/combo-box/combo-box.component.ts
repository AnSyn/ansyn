import { Component, ElementRef, forwardRef, Injector, Input, ViewChild } from '@angular/core';
import { ComboBoxTriggerComponent } from '../combo-box-trigger/combo-box-trigger.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

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
export class ComboBoxComponent implements ControlValueAccessor {
	onTouchedCallback: () => void = noop;
	onChangeCallback: (_: any) => void = noop;
	@ViewChild(ComboBoxTriggerComponent, {static: false}) trigger: ComboBoxTriggerComponent;
	@ViewChild('optionsContainer', {static: false}) optionsContainer: ElementRef;
	@Input() icon: string;
	disabled: boolean;
	selected: any;
	@Input() comboBoxToolTipDescription: string;
	@Input() direction: 'top' | 'bottom' = 'bottom';
	@Input() color: 'black' | 'transparent' = 'black';
	@Input() withArrow = true;
	@Input() alwaysChange: boolean;
	@Input() buttonClass: string;

	@Input() placeholder: string;
	@Input() required: boolean;
	optionsVisible = false;
	renderSelected = '';

	get optionsTrigger(): ElementRef {
		return this.trigger && this.trigger.optionsTrigger;
	}

	constructor(public injector: Injector) {
	}

	toggleShow() {
		this.optionsVisible = !this.optionsVisible;
		if (this.optionsVisible) {
			setTimeout(() => this.optionsContainer && this.optionsContainer.nativeElement.focus(), 0);
		}
	}

	onBlurOptionsContainer($event: FocusEvent) {
		if ($event.relatedTarget !== (this.optionsTrigger && this.optionsTrigger.nativeElement)) {
			this.close();
		}
	}

	selectOption(selected) {
		if (selected !== this.selected || this.alwaysChange) {
			this.selected = selected;
			this.onChangeCallback(selected);
		}
	}

	close() {
		this.optionsVisible = false;
	}

	registerOnChange(fn: any): void {
		this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouchedCallback = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	writeValue(value: any): void {
		if (value !== this.selected) {
			this.selected = value;
		}
	}
}
