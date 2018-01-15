import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { get } from 'lodash';

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
	@Input() selectedIndex: any;
	@Input() renderFunction: Function;
	@Input() toolTipField: string;
	@Input() comboBoxToolTipDescription: string;

	@Output() selectedIndexChange = new EventEmitter();

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

	selectOption(index) {
		this.optionsVisible = false;

		if (index !== this.selectedIndex) {
			this.selectedIndex = index;
			this.selectedIndexChange.emit(index);
		}
	}

	render(index) {
		if (this.renderFunction) {
			return this.renderFunction(index);
		}
		return get(this.options, index);
	}
}
