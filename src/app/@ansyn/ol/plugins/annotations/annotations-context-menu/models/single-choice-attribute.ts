
import { ControlType } from './control-type.enum';
import { AttributeBase } from './attribute-base';
import { IKeyValuePair } from './key-value.interface';

export class SingleChoiceAttribute extends AttributeBase<string> {
	type = ControlType.SingleChoice;
	options?: IKeyValuePair<string>[];

	constructor(
		options: {
			key?: string;
			label?: string;
			type?: ControlType;
			value?: string;
			options?: IKeyValuePair<string>[];
		} = {}
	) {
		super(options);
		this.options = options['options'] || [];
	}
}
