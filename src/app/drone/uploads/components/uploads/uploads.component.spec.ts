import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { UploadsComponent } from './uploads.component';
import { AnsynFormsModule, AnsynModalComponent, ErrorHandlerService, MockComponent } from '@ansyn/core';
import { FormsModule } from '@angular/forms';
import { UploadsConfig } from '../../config/uploads-config';
import { EditSensorNameComponent } from '../edit-sensor-name/edit-sensor-name.component';
import { HttpClientModule } from '@angular/common/http';
import { Store, StoreModule } from '@ngrx/store';
import { noop } from 'rxjs';
import { UploadFormData } from '../../actions/uploads.actions';
import { UploadListComponent } from '../upload-list/upload-list.component';
import { MatProgressBar } from '@angular/material';
import { UploadItemComponent } from '../upload-item/upload-item.component';
import { MultipleOverlaysSource } from '@ansyn/overlays';
import { TBOverlaySourceType } from '../../../overlay-source-provider/tb-source-provider';

const FakeMultipleOverlaysSource = {
	[TBOverlaySourceType]: {
		parseData: () => ({ id: 'fakeOverlay' })
	}
};

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
				UploadItemComponent,
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
				},
				{
					provide: MultipleOverlaysSource,
					useValue: FakeMultipleOverlaysSource
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

	it('isMobile should check if "mobile" string includes in input', () => {
		expect(component.isMobile('blbblbl Mobile blblblbl')).toBeTruthy();
		expect(component.isMobile('blblblbl blblblbl')).toBeFalsy();
	})
});
