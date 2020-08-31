import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material';

import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { IKeyValuePair } from '../../models/key-value.interface';

type Option = IKeyValuePair<string>;

@Component({
	selector: 'ansyn-multi-choice-attribute',
	templateUrl: './multi-choice-attribute.component.html',
	styleUrls: ['./multi-choice-attribute.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class MultiChoiceAttributeComponent {
	isMatChipSelectable = true;
	isMatChipRemovable = true;
	addEntityLabel = 'Add Entity';

	addTagCtrl = new FormControl();
	separatorKeysCodes: number[] = [ENTER, COMMA];
	addOnBlur = true;
	filteredOptions$: Observable<Option[]>;

	@ViewChild('addTagInput') addTagInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	@Output() onSelectOption = new EventEmitter<Option>();
	@Output() onRemoveOption = new EventEmitter<Option>();

	@Input() optionsList: Option[];
	@Input() selectedOptions: Option[] = [];
	@Input() set label(label: string) {
		this.addEntityLabel = 'Add ' + label;
	};

	constructor() {
		this.filteredOptions$ = this.addTagCtrl.valueChanges.pipe(
			startWith(null),
			map((option: string | null) => option ? this.filter(option) : this.optionsList.slice())
		);
	}

	selectOption(option: Option) {
		this.onSelectOption.emit(option);
	}

	removeOption(option: Option) {
		this.onRemoveOption.emit(option);
	}

	addOption(event: MatChipInputEvent): void {
		if (!this.matAutocomplete.isOpen) {
			const { input, value } = event;

			if ((value || '').trim()) {
				const option = this.optionsList.find(option => option.value === value.trim());
				if (!!option) {
					this.onSelectOption.emit(option);
				}
			}

			if (input) {
				input.value = '';
			}

			this.addTagCtrl.setValue(null);
		}
	}

	onSelected(event: MatAutocompleteSelectedEvent): void {
		const option = this.optionsList.find(option => option.value === event.option.viewValue);
		this.onSelectOption.emit(option);
		this.addTagInput.nativeElement.value = '';
		this.addTagCtrl.setValue(null);
	}

	private filter(value: string): Option[] {
		const filterValue = value.toLowerCase();

		return this.optionsList.filter(option => {
			const optionIndex = option.value.toLowerCase().indexOf(filterValue);
			return optionIndex === 0;
		});
	}
}
