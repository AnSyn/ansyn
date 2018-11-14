import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadsComponent } from './uploads.component';
import { AnsynFormsModule, AnsynModalComponent, ErrorHandlerService } from '@ansyn/core';
import { FormsModule } from '@angular/forms';
import { UploadsConfig } from '../../config/uploads-config';
import { EditSensorNameComponent } from '../edit-sensor-name/edit-sensor-name.component';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { noop } from 'rxjs';

describe('UploadsComponent', () => {
	let component: UploadsComponent;
	let fixture: ComponentFixture<UploadsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [AnsynFormsModule, FormsModule, HttpClientModule, StoreModule.forRoot({})],
			declarations: [UploadsComponent, AnsynModalComponent, EditSensorNameComponent],
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

	beforeEach(() => {
		fixture = TestBed.createComponent(UploadsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
