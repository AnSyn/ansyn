import { ControlType } from './control-type.enum';
import { IKeyValuePair } from './key-value.interface';
import { IAttributeData } from './attribute-data.interface';

export class AttributeBase<T> {
	value: T;
	key: string;
	label: string;
	type: ControlType;
	options?: IKeyValuePair<string>[];
	required?: boolean;

	constructor(
		{ key, label, type, value, required = false, options }: IAttributeData
	) {
		this.value = value;
		this.key = key;
		this.label = label || '';
		this.type = type;
		this.required = required;
		this.options = options || [];
	}
}
