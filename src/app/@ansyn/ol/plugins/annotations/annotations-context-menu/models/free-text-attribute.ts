import { ControlType } from './control-type.enum';
import { AttributeBase } from './attribute-base';
import { IKeyValuePair } from './key-value.interface';

export class FreeTextAttribute extends AttributeBase<string> {
	type = ControlType.FreeText;
	options?: IKeyValuePair<string>[];
	constructor(
		options: {
			key?: string;
			label?: string;
			type?: ControlType;
			value?: string;
		} = {}
	) {
		super(options);
		this.options = options['options'] || [];
	}
}
