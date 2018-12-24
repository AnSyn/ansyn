import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { UploadsComponent } from './uploads.component';
import {
	AnsynFormsModule,
	AnsynModalComponent,
	ErrorHandlerService,
	MockComponent,
	UploadProgressBarComponent
} from '@ansyn/core';
import { FormsModule } from '@angular/forms';
import { UploadsConfig } from '../../config/uploads-config';
import { EditSensorNameComponent } from '../edit-sensor-name/edit-sensor-name.component';
import { HttpClientModule } from '@angular/common/http';
import { Store, StoreModule } from '@ngrx/store';
import { noop } from 'rxjs';
import { UploadFormData } from '../../actions/uploads.actions';
import { UploadListComponent } from '../upload-list/upload-list.component';
import { MatProgressBar } from '@angular/material';

describe('UploadsComponent', () => {
	let component: UploadsComponent;
	let fixture: ComponentFixture<UploadsComponent>;
	const AnsynLoaderComponentMock = MockComponent({
		selector: 'ansyn-loader',
		inputs: ['show'],
		outputs: ['showChange']
	});
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [AnsynFormsModule, FormsModule, HttpClientModule, StoreModule.forRoot({})],
			declarations: [
				UploadsComponent,
				AnsynLoaderComponentMock,
				AnsynModalComponent,
				EditSensorNameComponent,
				UploadListComponent,
				UploadProgressBarComponent,
				MatProgressBar
			],
			providers: [
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: noop }
				},
				{
					provide: UploadsConfig,
					useValue: {
						defaultSensorType: '',
						sensorTypes: [],
						sensorNames: []
					}
				}
	]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(UploadsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('submitCustomSensorName should set sensorName value and close', () => {
		spyOn(store, 'dispatch');
		component.submitCustomSensorName('test');
		expect(store.dispatch).toHaveBeenCalledWith(new UploadFormData({ sensorName: 'test', otherSensorName: true }));
		expect(component.modal).toBeFalsy();
	});

});
