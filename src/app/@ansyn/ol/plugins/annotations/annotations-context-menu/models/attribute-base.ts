import { ControlType } from './control-type.enum';
import { IKeyValuePair } from './key-value.interface';

export class AttributeBase<T> {
	value: T;
	key: string;
	label: string;
	type: ControlType;
	options?: IKeyValuePair<string>[];
	required?: boolean;

	constructor(
		options: {
			key?: string;
			label?: string;
			type?: ControlType;
			value?: T;
			required?: boolean;
		} = {}
	) {
		this.value = options.value;
		this.key = options.key || '';
		this.label = options.label || '';
		this.type = options.type;

		this.required = options.required;
	}
}
