
import { Injectable } from '@angular/core';
import { AttributeBase } from '../models/attribute-base';
import { FreeTextAttribute } from '../models/free-text-attribute';
import { of, Observable } from 'rxjs';
import { SingleChoiceAttribute } from '../models/single-choice-attribute';
import { MultiChoiceAttribute } from '../models/multi-choice-attribute';
import { NumberAttribute } from '../models/number-attribute';

@Injectable({
	providedIn: 'root',
})
export class AttributesService {
	constructor() {}

	// TODO - get attributes model from config and convert it the the right attribute class
	getAttributes(): Observable<AttributeBase<any>[]> {
		const attributes: AttributeBase<any>[] = [
			new SingleChoiceAttribute({
				key: '2',
				label: 'Type',
				options: [
					{
						key: 'house',
						value: 'House',
					},
					{
						key: 'building',
						value: 'Building',
					},
					{
						key: 'vehicle',
						value: 'Vehicle',
					},
				],
			}),
			new MultiChoiceAttribute({
				key: '3',
				label: 'Tags',
				options: [
					{
						key: 'damaged',
						value: 'damaged',
					},
					{
						key: 'undamaged',
						value: 'un-damaged',
					},
					{
						key: 'region1',
						value: 'region1',
					},
					{
						key: 'region2',
						value: 'region2',
					},
				],
			}),
			new FreeTextAttribute({
				key: '1',
				label: 'Notes',
				value: 'add notes',
			}),
			new NumberAttribute({
				key: '4',
				label: 'Level of confidence',
				value: 4,
			})
		];

		return of(attributes);
	}
}
