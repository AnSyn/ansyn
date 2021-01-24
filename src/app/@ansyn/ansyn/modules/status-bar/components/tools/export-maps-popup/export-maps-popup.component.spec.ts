import { ComponentFixture, TestBed, tick, fakeAsync, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ExportMapsPopupComponent } from './export-maps-popup.component';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { TranslateModule } from '@ngx-translate/core';
import { toolsConfig } from '../models/tools-config';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MockComponent } from '../../../../core/test/mock-component';
import { CoreModule } from '../../../../core/core.module';
import { AnsynFormsModule } from '../../../../core/forms/ansyn-forms.module';
import { LoggerService } from '../../../../core/services/logger.service';
import { LoggerConfig } from '../../../../core/models/logger.config';


describe('ExportMapsPopupComponent', () => {
	let component: ExportMapsPopupComponent;
	let fixture: ComponentFixture<ExportMapsPopupComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ExportMapsPopupComponent, MockComponent({
				selector: 'ansyn-animated-ellipsis',
				inputs: ['text', 'rtl'],
				outputs: []
			})],
			imports: [
				CoreModule,
				FormsModule,
				HttpClientModule,
				AnsynFormsModule,
				MatDialogModule,
				MatSelectModule,
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer }),
				TranslateModule.forRoot()],
			providers: [ImageryCommunicatorService,
				{
					provide: MatDialogRef, useValue: {
						close: () => {}
					}
				},
				{
					provide: toolsConfig,
					useValue: {
						exportMap: {
							target: 'some-element',
							excludeClasses: []
						}
					}
				},
				LoggerService,
				{
					provide: LoggerConfig,
					useValue: {}
				}
			]
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

	it('when pdf selected export should call advancedExportMaps', fakeAsync(() => {
		spyOn(component, 'advancedExportMaps');
		component.selectedExportMethod = component.advancedExport;
		component.format = component.pdfFormat;
		tick();
		component.export();
		expect(component.advancedExportMaps).toHaveBeenCalled();
	}));
});
