import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
	overlayStatusFeatureKey,
	OverlayStatusReducer
} from '../../../overlays/overlay-status/reducers/overlay-status.reducer';

import { ManualRemovedOverlaysComponent } from './manual-removed-overlays.component';
import { StoreModule } from '@ngrx/store';
import { SliderCheckboxComponent } from '../../forms/slider-checkbox/slider-checkbox.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ManualRemovedOverlaysComponent', () => {
	let component: ManualRemovedOverlaysComponent;
	let fixture: ComponentFixture<ManualRemovedOverlaysComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SliderCheckboxComponent, ManualRemovedOverlaysComponent],
			imports: [StoreModule.forRoot({
				[overlayStatusFeatureKey]: OverlayStatusReducer
			}),
				TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ManualRemovedOverlaysComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
