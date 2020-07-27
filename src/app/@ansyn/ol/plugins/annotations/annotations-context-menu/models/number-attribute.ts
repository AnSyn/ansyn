
import { ControlType } from './control-type.enum';
import { AttributeBase } from './attribute-base';
import { IKeyValuePair } from './key-value.interface';

export class NumberAttribute extends AttributeBase<number> {
	type = ControlType.Number;
	options?: IKeyValuePair<string>[];

	constructor(
		options: {
			key?: string;
			label?: string;
			type?: ControlType;
			value?: number;
			options?: IKeyValuePair<string>[];
		} = {}
	) {
		super(options);
		this.options = options['options'] || [];
	}
}
