import { ControlType } from './control-type.enum';
import { AttributeBase } from './attribute-base';
import { IKeyValuePair } from './key-value.interface';
import { IAttributeData } from './attribute-data.interface';

export class MultiChoiceAttribute extends AttributeBase<IKeyValuePair<string>[]> {

	private selectedOptions: IKeyValuePair<string>[];
	private _value: IKeyValuePair<string>[];

	constructor(
		data: IAttributeData
	) {
		super(data);
		this.type = ControlType.MultipleChoices;

		if (!!data.value && !Array.isArray(data.value)) {
			throw new Error('Value must be of type IKeyValuePair<string>[]');
		}
		if (!data.value) {
			this.setValue([]);
		}
	}

	getValue() {
		return this._value;
	}

	setValue(value: IKeyValuePair<string>[]) {
		if (!!value) {
			this._value = [...value];
			this.selectedOptions = [...value]
		}
	}


	addSelectedOption(option: IKeyValuePair<string>) {
		if (this.selectedOptions.includes(option)) {
			return;
		}
		this.selectedOptions.push(option);
		this._value = this.selectedOptions;
	}

	removeSelectedOption(option: IKeyValuePair<string>) {
		const index = this.selectedOptions.indexOf(option);

		if (index >= 0) {
			this.selectedOptions.splice(index, 1);
		}
		this._value = this.selectedOptions;

	}

	getSelectedOptions() {
		return [...this.value];
	}
}
