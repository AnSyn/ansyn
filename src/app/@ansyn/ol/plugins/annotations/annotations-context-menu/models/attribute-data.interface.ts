import { ControlType } from "./control-type.enum";
import { IKeyValuePair } from "./key-value.interface";

export interface IAttributeData {
	key: string;
	label?: string;
	type?: ControlType;
	value?: any;
	required?: boolean;
	options?: IKeyValuePair<string>[];
}
