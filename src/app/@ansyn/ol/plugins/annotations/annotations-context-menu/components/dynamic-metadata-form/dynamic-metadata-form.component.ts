import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AttributeBase } from '../../models/attribute-base';
import { FormGroup } from '@angular/forms';
import { AttributeControlService } from '../../services/attribute-control.service';

@Component({
	selector: 'ansyn-dynamic-metadata-form',
	templateUrl: './dynamic-metadata-form.component.html',
	styleUrls: ['./dynamic-metadata-form.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicMetadataFormComponent implements OnInit, OnDestroy {
	form: FormGroup;
	@Input() attributes: AttributeBase<any>[] = [];
	@Output() onSubmit = new EventEmitter<AttributeBase<any>[]>();
	constructor(private attributeCtlService: AttributeControlService) {}

	ngOnInit(): void {
		this.form = this.attributeCtlService.toFormGroup(this.attributes);
	}

	submit() {
		this.onSubmit.emit(this.attributes);
	}

	ngOnDestroy() {
		this.attributeCtlService.unregisterValueChanges();
	}
}
