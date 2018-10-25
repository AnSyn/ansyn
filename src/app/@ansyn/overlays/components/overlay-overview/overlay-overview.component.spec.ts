import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { OverlayOverviewComponent } from './overlay-overview.component';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { By } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IOverlay, MockComponent } from '@ansyn/core';
import { IOverlaysState, OverlayReducer, overlaysFeatureKey } from '../../reducers/overlays.reducer';
import { OverlaysConfig } from '../../services/overlays.service';
import { SetHoveredOverlayAction } from '../../actions/overlays.actions';

describe('OverlayOverviewComponent', () => {
	let component: OverlayOverviewComponent;
	let fixture: ComponentFixture<OverlayOverviewComponent>;
	let store: Store<any>;
	let document: Document;

	const mockLoader = MockComponent({ selector: 'ansyn-loader', inputs: ['show', 'loaderText'] });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				TranslateModule.forRoot(),
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer }),
				EffectsModule.forRoot([])
			],
			providers: [
				{
					provide: OverlaysConfig,
					useValue: {}
				}
			],
			declarations: [OverlayOverviewComponent, mockLoader]
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
		let overlays: IOverlay[] = [{
			id: overlayId,
			name: 'bcd',
			photoTime: 'ttt',
			date: new Date(),
			azimuth: 100,
			isGeoRegistered: true
		}];
		let neededElement: Element;

		beforeAll(() => {
			neededElement = document.createElement('CIRCLE');
			neededElement.id = `dropId-${overlayId}`;
			document.body.appendChild(neededElement);
		});
		it('should hide me by default', () => {
			expect(classExists('show')).toBeFalsy();
		});
		it('should show or hide me according to store', () => {
			store.dispatch(new SetHoveredOverlayAction(overlays[0]));
			fixture.detectChanges();
			expect(classExists('show')).toBeTruthy();
			store.dispatch(new SetHoveredOverlayAction(null));
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

	fit('showPreview should change value of isHoveringOverDrop to true, and call mouseMove$.subscribe ', () => {
		spyOn(component.mouseMove$, 'subscribe');
		component.showOverview();
		expect(component.isHoveringOverDrop).toBeTruthy();
		expect(component.mouseMove$.subscribe).toHaveBeenCalled();
	});

	fit('showPreview should change value of isHoveringOverDrop to false', () => {
		component.showOverview();
		expect(component.isHoveringOverDrop).toBeTruthy();
	});
});
