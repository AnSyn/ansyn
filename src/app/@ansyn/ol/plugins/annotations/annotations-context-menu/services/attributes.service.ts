
import { Injectable, Inject } from '@angular/core';
import { AttributeBase } from '../models/attribute-base';
import { FreeTextAttribute } from '../models/free-text-attribute';
import { of, Observable } from 'rxjs';
import { SingleChoiceAttribute } from '../models/single-choice-attribute';
import { MultiChoiceAttribute } from '../models/multi-choice-attribute';
import { NumberAttribute } from '../models/number-attribute';
import { OL_PLUGINS_CONFIG, IOLPluginsConfig, IConfigAttribute } from '../../../plugins.config';
import { ControlType } from '../models/control-type.enum';

@Injectable({
	providedIn: 'root',
})
export class AttributesService {
	constructor(
		@Inject(OL_PLUGINS_CONFIG) private olPluginsConfig: IOLPluginsConfig
	) {}

	getAttributes(): Observable<AttributeBase<any>[]> {
		const configAttributes: IConfigAttribute[] = this.olPluginsConfig.AnnotationsContextMenu.metadata.attributes
		const attributes: AttributeBase<any>[] = [];
		configAttributes.forEach(({key, label, options, type}) => {
			switch (type) {
				case ControlType.FreeText: {
					const att = new FreeTextAttribute({ key, label });
					attributes.push(att);
					break;
				}
				case ControlType.MultipleChoices: {
					const att = new MultiChoiceAttribute({ key, label, options });
					attributes.push(att);
					break;
				}
				case ControlType.Number: {
					const att = new NumberAttribute({ key, label });
					attributes.push(att);
					break;
				}
				case ControlType.SingleChoice: {
					const att = new SingleChoiceAttribute({ key, label, options });
					attributes.push(att);
					break;
				}
				default: {
					throw new Error("Unsupported type of attribute");
				}
			}
		});

		return of(attributes);
	}
}
