import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { OverlayOverviewComponent } from './overlay-overview.component';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
	IOverlaysState,
	MarkUpClass,
	OverlayReducer,
	overlaysFeatureKey
} from '@ansyn/overlays/reducers/overlays.reducer';
import {
	LoadOverlaysSuccessAction, SetMarkUp
} from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { By } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

describe('OverlayOverviewComponent', () => {
	let component: OverlayOverviewComponent;
	let fixture: ComponentFixture<OverlayOverviewComponent>;
	let store: Store<any>;
	let document: Document;

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

	beforeEach(inject([Store, DOCUMENT], (_store: Store<IOverlaysState>, _document: Document) => {
		store = _store;
		document = _document;
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
		let neededElement: Element;

		beforeAll(() => {
			neededElement = document.createElement("CIRCLE");
			neededElement.id = `dropId-${overlayId}`;
			document.body.appendChild(neededElement);
		});
		it('should hide me by default', () => {
			expect(classExists('show')).toBeFalsy();
		});
		it('should show or hide me according to store', () => {
			store.dispatch(new LoadOverlaysSuccessAction(overlays));
			store.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [overlayId] } }));
			fixture.detectChanges();
			expect(classExists('show')).toBeTruthy();
			store.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
			fixture.detectChanges();
			expect(classExists('show')).toBeFalsy();
		});
		afterAll(() => {
			document.body.removeChild(neededElement);
		});
	});

	describe('on double click', () => {
		let div: any;
		beforeEach(() => {
			div = fixture.debugElement.query(By.css('.overlay-overview'));
		});
		it('Div should exist', () => {
			expect(div).toBeDefined();
		});
		it('should call store.dispatch when double clicking on the image', () => {
			spyOn(component.store$, 'dispatch');
			div.triggerEventHandler('dblclick', {});
			fixture.detectChanges();
			expect(component.store$.dispatch).toHaveBeenCalled();
		});
	});

	describe('on mouse leave', () => {
		it('should call store.dispatch on mouse leave event', () => {
			let spy = spyOn(component.store$, 'dispatch');
			fixture.debugElement.triggerEventHandler('mouseleave', {});
			fixture.detectChanges();
			expect(spy).toHaveBeenCalled();
		});
	});
});
