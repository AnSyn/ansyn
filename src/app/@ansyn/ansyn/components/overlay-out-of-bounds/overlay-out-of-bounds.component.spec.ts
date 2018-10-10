import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayOutOfBoundsComponent } from './overlay-out-of-bounds.component';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { By } from '@angular/platform-browser';

describe('OverlayOutOfBoundsComponent', () => {
	let component: OverlayOutOfBoundsComponent;
	let fixture: ComponentFixture<OverlayOutOfBoundsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer })
			],
			providers: [ImageryCommunicatorService],
			declarations: [OverlayOutOfBoundsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayOutOfBoundsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('click on button should call "backToExtent"', () => {
		spyOn(component, 'backToExtent');
		const button = fixture.debugElement.query(By.css('button'));
		button.triggerEventHandler('click', {});
		expect(component.backToExtent).toHaveBeenCalled();
	});

});
