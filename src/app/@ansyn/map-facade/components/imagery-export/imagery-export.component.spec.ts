import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';

import { ImageryExportComponent } from './imagery-export.component';
import { DOCUMENT } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

describe('ImageryExportComponent', () => {
	let component: ImageryExportComponent;
	let fixture: ComponentFixture<ImageryExportComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryExportComponent],
			imports: [
				TranslateModule.forRoot(),
				StoreModule.forRoot({
					[mapFeatureKey]: MapReducer
				})
			],
			providers: [
				ImageryCommunicatorService,
				{
					provide: DOCUMENT,
					useValue: document
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryExportComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
