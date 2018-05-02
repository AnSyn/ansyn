import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { OverlayOverviewComponent } from './overlay-overview.component';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IOverlaysState, OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import {
	ClearHoveredOverlay,
	LoadOverlaysSuccessAction,
	SetHoveredOverlay
} from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { By } from '@angular/platform-browser';

describe('OverlayOverviewComponent', () => {
	let component: OverlayOverviewComponent;
	let fixture: ComponentFixture<OverlayOverviewComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer }),
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

	describe('Show or hide me', () => {
		let classExists = (className) => fixture.nativeElement.classList.contains(className);
		let overlayId = '234';
		let overlays: Overlay[] = [{
			id: overlayId,
			name: 'bcd',
			photoTime: 'ttt',
			date: new Date(),
			azimuth: 100,
			isGeoRegistered: true
		}];
		it('should hide me by default', () => {
			expect(classExists('show')).toBeFalsy();
		});
		it('should show or hide me according to store', () => {
			store.dispatch(new LoadOverlaysSuccessAction(overlays));
			store.dispatch(new SetHoveredOverlay({ overlayId: overlayId }));
			fixture.detectChanges();
			expect(classExists('show')).toBeTruthy();
			store.dispatch(new ClearHoveredOverlay());
			fixture.detectChanges();
			expect(classExists('show')).toBeFalsy();
		});
	});

	describe('on double click', () => {
		let image: any;
		beforeEach(() => {
			image = fixture.debugElement.query(By.css('img'));
		});
		it('image should exist', () => {
			expect(image).toBeDefined();
		});
		it('should call store.dispatch when double clicking on the image', () => {
			spyOn(component.store$, 'dispatch');
			image.triggerEventHandler('dblclick', {});
			fixture.detectChanges();
			expect(component.store$.dispatch).toHaveBeenCalled();
		});
	});

	describe('on mouse leave', () => {
		it('should call store.dispatch twice on mouse leave event', () => {
			let calls = spyOn(component.store$, 'dispatch').calls;
			fixture.debugElement.triggerEventHandler('mouseleave', {});
			fixture.detectChanges();
			expect(calls.count()).toEqual(2);
		});
	});
});
