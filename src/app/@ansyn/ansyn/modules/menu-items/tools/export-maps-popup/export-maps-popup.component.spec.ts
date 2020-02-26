import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ExportMapsPopupComponent } from './export-maps-popup.component';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';

describe('ExportMapsPopupComponent', () => {
	let component: ExportMapsPopupComponent;
	let fixture: ComponentFixture<ExportMapsPopupComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ExportMapsPopupComponent],
			imports: [MatProgressBarModule, StoreModule.forRoot({[mapFeatureKey]: MapReducer})],
			providers: [ImageryCommunicatorService,
						{ provide: MatDialogRef, useValue: {} },
						{ provide: MatDialog, useValue: {} }]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ExportMapsPopupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();

	});
});
