import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AttributeBase } from '../../models/attribute-base';
import { FormGroup } from '@angular/forms';
import { ControlType } from '../../models/control-type.enum';
import { IKeyValuePair } from '../../models/key-value.interface';
import { MultiChoiceAttribute } from '../../models/multi-choice-attribute';

@Component({
	selector: 'ansyn-dynamic-attribute-control',
	templateUrl: './dynamic-attribute-control.component.html',
	styleUrls: ['./dynamic-attribute-control.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicAttributeControlComponent {
	controlType = ControlType;
	@Input() attribute: AttributeBase<any>;
	
	// tslint:disable-next-line:no-input-rename
	@Input('form') attributesForm: FormGroup;
	get isValid() {
		return this.attributesForm.controls[this.attribute.key].valid;
	}

	selectOption(option: IKeyValuePair<string>) {
		(this.attribute as MultiChoiceAttribute).addSelectedOption(option);
	}
	removeOption(option: IKeyValuePair<string>) {
		(this.attribute as MultiChoiceAttribute).removeSelectedOption(option);
	}

	getSelectedOptions() {
		return (this.attribute as MultiChoiceAttribute).getSelectedOptions();
	}
}
