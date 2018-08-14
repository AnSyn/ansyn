import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualRemovedOverlaysComponent } from './manual-removed-overlays.component';
import { StoreModule } from '@ngrx/store';
import { SliderCheckboxComponent } from '@ansyn/core/components/slider-checkbox/slider-checkbox.component';

describe('ManualRemovedOverlaysComponent', () => {
	let component: ManualRemovedOverlaysComponent;
	let fixture: ComponentFixture<ManualRemovedOverlaysComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SliderCheckboxComponent, ManualRemovedOverlaysComponent],
			imports: [StoreModule.forRoot({})]
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
