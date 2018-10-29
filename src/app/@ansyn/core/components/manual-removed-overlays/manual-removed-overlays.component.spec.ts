import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualRemovedOverlaysComponent } from './manual-removed-overlays.component';
import { StoreModule } from '@ngrx/store';
import { SliderCheckboxComponent } from '../../forms/slider-checkbox/slider-checkbox.component';
import { coreFeatureKey, CoreReducer } from '../../reducers/core.reducer';

describe('ManualRemovedOverlaysComponent', () => {
	let component: ManualRemovedOverlaysComponent;
	let fixture: ComponentFixture<ManualRemovedOverlaysComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SliderCheckboxComponent, ManualRemovedOverlaysComponent],
			imports: [StoreModule.forRoot({ [coreFeatureKey]: CoreReducer })]
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
