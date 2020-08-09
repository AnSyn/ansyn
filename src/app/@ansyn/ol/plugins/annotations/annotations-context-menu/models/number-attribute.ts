
import { ControlType } from './control-type.enum';
import { AttributeBase } from './attribute-base';
import { IAttributeData } from './attribute-data.interface';

export class NumberAttribute extends AttributeBase<number> {
	constructor(
		data: IAttributeData
	) {
		super(data);
		this.type = ControlType.Number;

		if (!!data.value && typeof data.value !== 'number') {
			throw new Error('Value must be of type number');
		}
	}
}
