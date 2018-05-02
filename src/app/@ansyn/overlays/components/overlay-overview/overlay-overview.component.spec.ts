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

	describe('Show or hide me according to store', () => {
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
			store.dispatch(new SetHoveredOverlay({ id: overlayId }));
			fixture.detectChanges();
			expect(classExists('show')).toBeTruthy();
			store.dispatch(new ClearHoveredOverlay());
			fixture.detectChanges();
			expect(classExists('show')).toBeFalsy();
		});
	});
});
