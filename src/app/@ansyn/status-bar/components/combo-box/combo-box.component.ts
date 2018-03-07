import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
	selector: 'ansyn-combo-box',
	templateUrl: './combo-box.component.html',
	styleUrls: ['./combo-box.component.less']
})
export class ComboBoxComponent {
	@ViewChild('optionsTrigger') optionsTrigger: ElementRef;
	@ViewChild('optionsContainer') optionsContainer: ElementRef;

	@Input() icon: string;
	@Input() options: any[];
	@Input() selected: any;
	@Input() renderFunction: Function;
	@Input() toolTipField: string;
	@Input() comboBoxToolTipDescription: string;

	@Output() selectedChange = new EventEmitter();

	optionsVisible = false;

	toggleShow() {
		this.optionsVisible = !this.optionsVisible;
		if (this.optionsVisible) {
			setTimeout(() => this.optionsContainer.nativeElement.focus(), 0);
		}
	}

	onBlurOptionsContainer($event: FocusEvent) {
		if ($event.relatedTarget !== this.optionsTrigger.nativeElement) {
			this.optionsVisible = false;
		}
	}

	selectOption(selected) {
		this.optionsVisible = false;

		if (selected !== this.selected) {
			this.selected = selected;
			this.selectedChange.emit(selected);
		}
	}

	render(selected) {
		if (this.renderFunction) {
			return this.renderFunction(selected);
		}
		return selected;
	}
}
