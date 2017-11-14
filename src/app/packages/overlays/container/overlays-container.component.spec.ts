import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { createStore, MockComponent, StoreFixture } from '@ansyn/core/test';
import { OverlaysContainerComponent } from './overlays-container.component';
import { OverlaysConfig, OverlaysService } from '../services/overlays.service';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { Observable } from 'rxjs/Rx';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Overlay } from '../models/overlay.model';
import { OverlaysEffects } from '../effects/overlays.effects';

import { State, Store, StoreModule } from '@ngrx/store';

import { IOverlaysState, OverlayReducer, overlaysFeatureKey } from '../reducers/overlays.reducer';
import {
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	SelectOverlayAction,
	UnSelectOverlayAction
} from '../actions/overlays.actions';
import { Actions } from '@ngrx/effects';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { HttpClientModule } from '@angular/common/http';

class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Mock';

	public fetch(fetchParams: IFetchParams): Observable<Overlay[]> {
		return Observable.empty();
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return Observable.empty();
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	};

	public getById(id: string, sourceType: string = null): Observable<Overlay> {
		return Observable.empty();
	};
}


describe('OverlayContainerComponent', () => {
	let component: OverlaysContainerComponent;
	let fixture: ComponentFixture<OverlaysContainerComponent>;
	let overlaysService: OverlaysService;
	let overlaysEffects: OverlaysEffects;
	let de: DebugElement;

	let storeFixture: StoreFixture<IOverlaysState>;
	let store: Store<IOverlaysState>;
	let state: State<{ overlays: IOverlaysState }>;
	let getState: () => IOverlaysState;

	let timelineEmitterService: TimelineEmitterService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [
				OverlaysService,
				TimelineEmitterService,
				OverlaysEffects,
				Actions,
				{
					provide: OverlaysConfig, useValue: {
					'baseUrl': 'http://localhost:9001/api/v1/',
					'overlaysByCaseId': 'case/:id/overlays',
					'overlaysByTimeAndPolygon': 'overlays/find',
					'defaultApi': 'overlays',
					'searchByCase': false,
					'overlaySource': 'IDAHO',
					'polygonGenerationDistance': 0.1
				}
				},
				{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock }
			],
			declarations: [
				OverlaysContainerComponent,
				MockComponent({ selector: 'ansyn-timeline', inputs: ['drops', 'configuration', 'redraw$', 'markup'] })
			],
			imports: [
				HttpClientModule,
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer })
			]
		})
			.compileComponents();

		storeFixture = createStore(OverlayReducer);
		store = storeFixture.store;
		getState = storeFixture.getState;
		state = <State<any>> storeFixture.state; // (overlaysInitialState);
		// state = overlaysInitialState;
	}));

	beforeEach(inject([TimelineEmitterService], (_timelineEmitterService) => {
		fixture = TestBed.createComponent(OverlaysContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		overlaysService = fixture.debugElement.injector.get(OverlaysService);
		overlaysEffects = fixture.debugElement.injector.get(OverlaysEffects);
		timelineEmitterService = _timelineEmitterService;
	}));


	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check that the listeners that is set in ngAfterViewInit is been called with selected data an unselected data', () => {
		const data = {
			element: {
				id: 'test'
			}
		};
		spyOn(store, 'dispatch');

		component.selectedOverlays = ['test'];
		timelineEmitterService.provide('timeline:dblclick').next(data);
		expect(store.dispatch).toHaveBeenCalledTimes(1);

	});

	it('check that the listeners that is set in ngAfterViewInit is been called with selected data an unselected data', () => {
		const data = {
			element: {
				id: 'test'
			}
		};
		spyOn(store, 'dispatch');
		timelineEmitterService.provide('timeline:dblclick').next(data);
		expect(store.dispatch).toHaveBeenCalledTimes(2);

	});

	it('check for timeline single click', () => {
		spyOn(component, 'toggleOverlay');
		const data = {
			element: {
				id: 'test'
			}
		};
		timelineEmitterService.provide('timeline:click').next(data);
		expect(component.toggleOverlay).toHaveBeenCalledWith(data.element.id);

	});

	it('check that we subscribing for both overlays and selected overlays', () => {
		component.ngOnInit();
		expect(Object.keys(component.subscribers).length).toEqual(10);
	});

	it('check the function toggle overlay', () => {
		spyOn(store, 'dispatch');
		const id1 = '32313';
		const expectedResult1 = new SelectOverlayAction(id1);
		const expectedResult2 = new UnSelectOverlayAction(id1);

		component.toggleOverlay(id1);
		expect(store.dispatch).toHaveBeenCalledWith(expectedResult1);
		component.selectedOverlays.push(id1);
		component.toggleOverlay(id1);
		expect(store.dispatch).toHaveBeenCalledWith(expectedResult2);
	});


	it('should distinguish between changed data', () => {
		const overlays = < Overlay[] > [{
			id: '12',
			name: 'tmp12',
			photoTime: new Date(Date.now()).toISOString(),
			azimuth: 10
		}, {
			id: '13',
			name: 'tmp13',
			photoTime: new Date(Date.now()).toISOString(),
			azimuth: 10
		}];

		store.dispatch(new LoadOverlaysAction());
		expect(state.value.overlays.loading).toBe(true);

		store.dispatch(new LoadOverlaysSuccessAction(overlays));
		expect(state.value.overlays.overlays.size).toEqual(2);
		expect(state.value.overlays.loading).toBe(false);

	});
	/*
			this is nice test I am keeping it as an example
		 */
	// xit('check that fetchData has been called', () => {
	//     spyOn(overlaysService, 'getByCase').and.callFake(() => {
	//         return Observable.create((observer: Observer < any > ) => {
	//             observer.next({ key: 'value' });
	//         });
	//     });
	//     component.ngOnInit();
	//     expect(overlaysService.getByCase).toHaveBeenCalled();
	// })


	it('check that the container div is in he\'s place', () => {
		de = fixture.debugElement.query(By.css('.overlays-container'));
		expect(de.nativeElement.childElementCount).toBe(1);

	});

});
