import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualRemovedOverlaysComponent } from './manual-removed-overlays.component';
import { StoreModule } from '@ngrx/store';
import { SliderCheckboxComponent } from '../../forms/slider-checkbox/slider-checkbox.component';
import { imageryStatusFeatureKey, ImageryStatusReducer } from '@ansyn/map-facade';

describe('ManualRemovedOverlaysComponent', () => {
	let component: ManualRemovedOverlaysComponent;
	let fixture: ComponentFixture<ManualRemovedOverlaysComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SliderCheckboxComponent, ManualRemovedOverlaysComponent],
			imports: [StoreModule.forRoot({
				[imageryStatusFeatureKey]: ImageryStatusReducer
			})]
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
