import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AttributeBase } from '../../models/attribute-base';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
	selector: 'ansyn-dynamic-metadata-form',
	templateUrl: './dynamic-metadata-form.component.html',
	styleUrls: ['./dynamic-metadata-form.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicMetadataFormComponent implements OnInit, OnDestroy {
	private valueChangesSubscriptions: Subscription[] = [];
	form: FormGroup;
	@Input() attributes: AttributeBase<any>[] = [];
	@Output() onSubmit = new EventEmitter<AttributeBase<any>[]>();
	constructor() {}

	ngOnInit(): void {
		this.form = this.toFormGroup(this.attributes);
		this.registerControlsValueChanges();
	}

	submit() {
		this.onSubmit.emit(this.attributes);
	}

	ngOnDestroy() {
		this.unregisterControlsValueChanges();
	}

	private toFormGroup(attributes: AttributeBase<any>[]) {
		const group: { [key: string]: FormControl } = {};

		attributes.forEach((attribute) => {
			group[attribute.key] = attribute.required ? new FormControl(attribute.value || '', Validators.required) : new FormControl(attribute.value || '');
		});
		return new FormGroup(group);
	}

	private registerControlsValueChanges() {
		this.attributes.forEach((attribute) => {
			const sub = this.form.controls[attribute.key].valueChanges.subscribe((value) => {
				attribute.value = value;
			});
			this.valueChangesSubscriptions.push(sub);
		});
	}
	private unregisterControlsValueChanges() {
		this.valueChangesSubscriptions.forEach((sub) => {
			sub.unsubscribe();
		});
		this.valueChangesSubscriptions = [];
	}
}
