
import { ControlType } from './control-type.enum';
import { AttributeBase } from './attribute-base';
import { IAttributeData } from './attribute-data.interface';

export class SingleChoiceAttribute extends AttributeBase<string> {
	constructor(
		data: IAttributeData
	) {
		super(data);
		this.type = ControlType.SingleChoice;
		if (!!data.value && typeof data.value !== 'string') {
			throw new Error('Value must be of type string');
		}
	}
}
