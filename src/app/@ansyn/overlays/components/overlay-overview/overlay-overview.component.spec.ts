import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { OverlayOverviewComponent } from './overlay-overview.component';
import { By } from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IOverlaysState, OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import { ClearHoveredOverlay, SetHoveredOverlay } from '@ansyn/overlays/actions/overlays.actions';

fdescribe('OverlayOverviewComponent', () => {
	let component: OverlayOverviewComponent;
	let fixture: ComponentFixture<OverlayOverviewComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({[overlaysFeatureKey]: OverlayReducer}),
				EffectsModule.forRoot([])
			],
			declarations: [OverlayOverviewComponent]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IOverlaysState>) => {
		store = _store;
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayOverviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('Show or hide me according to store', () => {
		let innerWrapper: any;
		beforeEach(() => {
			innerWrapper = fixture.debugElement.query(By.css('.overlay-overview'));
		});
		it('inner wrapper should exist', () => {
			expect(innerWrapper).toBeDefined();
		});
		it ('should hide me by default', () => {
			expect(innerWrapper.nativeElement.hidden).toBeTruthy();
		});
		it ('should show or hide me according to store', () => {
			store.dispatch(new SetHoveredOverlay({id: '234'}));
			fixture.detectChanges();
			expect(innerWrapper.nativeElement.hidden).toBeFalsy();
			store.dispatch(new ClearHoveredOverlay());
			fixture.detectChanges();
			expect(innerWrapper.nativeElement.hidden).toBeTruthy();
		});
	});
});
