import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlaysContainerComponent } from './overlays-container.component';
import { OverlaysService } from '../../services/overlays.service';
import { Observable } from 'rxjs/Rx';
import { DebugElement } from '@angular/core';
import { createStore, IOverlay, IOverlaysFetchData, IStoreFixture, MockComponent } from '@ansyn/core';
import { OverlaysEffects } from '../../effects/overlays.effects';
import { State, Store, StoreModule } from '@ngrx/store';
import { IOverlaysState, OverlayReducer, overlaysFeatureKey } from '../../reducers/overlays.reducer';
import { LoadOverlaysAction, LoadOverlaysSuccessAction } from '../../actions/overlays.actions';
import { HttpClientModule } from '@angular/common/http';
import { BaseOverlaySourceProvider, IFetchParams } from '../../models//base-overlay-source-provider.model';

class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Mock';

	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return Observable.empty();
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return Observable.empty();
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	};

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return Observable.empty();
	};
}


describe('OverlayContainerComponent', () => {
	let component: OverlaysContainerComponent;
	let fixture: ComponentFixture<OverlaysContainerComponent>;
	let overlaysService: OverlaysService;
	let overlaysEffects: OverlaysEffects;
	let de: DebugElement;

	let storeFixture: IStoreFixture<IOverlaysState>;
	let store: Store<IOverlaysState>;
	let state: State<{ overlays: IOverlaysState }>;
	let getState: () => IOverlaysState;

	beforeEach(async(() => {
		TestBed.configureTestingModule({

			declarations: [
				OverlaysContainerComponent,
				MockComponent({ selector: 'ansyn-timeline', inputs: ['drops', 'timeLineRange', 'redraw$', 'markup'] }),
				MockComponent({ selector: 'ansyn-overlay-status', inputs: [] })
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


	beforeEach(() => {
		fixture = TestBed.createComponent(OverlaysContainerComponent);
		component = fixture.componentInstance;

		it('should distinguish between changed data', () => {
			const overlays = < IOverlay[] > [{
				id: '12',
				name: 'tmp12',
				photoTime: new Date(Date.now()).toISOString(),
				azimuth: 10
			}, {
				id: '13',
				name: 'tmp13',
				photoTime: new Date(Date.now()).toISOString(),
				azimuth: 10
			}
			];

			store.dispatch(new LoadOverlaysAction({}));
			expect(state.value.overlays._loading).toBeTruthy();

			store.dispatch(new LoadOverlaysSuccessAction(overlays));
			expect(state.value.overlays.overlays.size).toEqual(2);
			expect(state.value.overlays._loading).toBeFalsy();

		});

	});
});

