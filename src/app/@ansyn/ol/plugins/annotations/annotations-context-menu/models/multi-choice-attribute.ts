import { ControlType } from './control-type.enum';
import { AttributeBase } from './attribute-base';
import { IKeyValuePair } from './key-value.interface';

export class MultiChoiceAttribute extends AttributeBase<IKeyValuePair<string>[]> {
	type = ControlType.MultipleChoices;
	options: IKeyValuePair<string>[];
	private selectedOptions: IKeyValuePair<string>[] = [];
	value = [];

	constructor(
		options: {
			key?: string;
			label?: string;
			type?: ControlType;
			value?: IKeyValuePair<string>[];
			options?: IKeyValuePair<string>[];
		} = {}
	) {
		super(options);
		this.options = options['options'] || [];
	}

	addSelectedOption(option: IKeyValuePair<string>) {
		if (this.selectedOptions.includes(option)) {
			return;
		}
		this.selectedOptions.push(option);
		this.value = this.selectedOptions;
	}

	removeSelectedOption(option: IKeyValuePair<string>) {
		const index = this.selectedOptions.indexOf(option);

		if (index >= 0) {
			this.selectedOptions.splice(index, 1);
		}
		this.value = this.selectedOptions;

	}

	getSelectedOptions() {
		return [...this.value];
	}
}
