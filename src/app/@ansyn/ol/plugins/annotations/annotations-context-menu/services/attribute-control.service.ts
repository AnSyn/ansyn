import { Injectable } from '@angular/core';
import { AttributeBase } from '../models/attribute-base';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AttributeControlService {
	private subscriptions: Subscription[] = [];

	toFormGroup(attributes: AttributeBase<any>[]) {
		let group: { [key: string]: FormControl } = {};

		attributes.forEach((attribute) => {
			group[attribute.key] = attribute.required ? new FormControl(attribute.value || '', Validators.required) : new FormControl(attribute.value || '');
			const sub = group[attribute.key].valueChanges.subscribe((value) => {
				attribute.value = value;
			});
			this.subscriptions.push(sub);
		});
		return new FormGroup(group);
	}

	unregisterValueChanges() {
		this.subscriptions.forEach((sub) => {
			sub.unsubscribe();
		});
		this.subscriptions = [];
	}
}
