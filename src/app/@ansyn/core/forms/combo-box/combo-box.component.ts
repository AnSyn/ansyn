import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
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
	@ViewChild(ComboBoxTriggerComponent) trigger: ComboBoxTriggerComponent;
	@ViewChild('optionsContainer') optionsContainer: ElementRef;
	@Input() icon: string;
	disabled: boolean;
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
		this.disabled = isDisabled;
	}

	writeValue(value: any): void {
		if (value !== this.selected) {
			this.selected = value;
		}
	}
}
