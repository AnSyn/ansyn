import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlaysContainerComponent } from './overlays-container.component';
import { OverlaysService } from '../../services/overlays.service';
import { EMPTY, Observable } from 'rxjs';
import { DebugElement } from '@angular/core';
import { OverlaysEffects } from '../../effects/overlays.effects';
import { State, Store, StoreModule } from '@ngrx/store';
import { IOverlaysState, OverlayReducer, overlaysFeatureKey } from '../../reducers/overlays.reducer';
import { LoadOverlaysAction, LoadOverlaysSuccessAction } from '../../actions/overlays.actions';
import { HttpClientModule } from '@angular/common/http';
import { BaseOverlaySourceProvider, IFetchParams } from '../../models//base-overlay-source-provider.model';
import { OverlaySourceProvider } from '../../models/overlays-source-providers';
import { createStore, IStoreFixture } from '../../../core/test/mock-store';
import { MockComponent } from '../../../core/test/mock-component';
import { IOverlay, IOverlaysFetchData } from '../../models/overlay.model';

@OverlaySourceProvider({
	sourceType: 'Mock'
})
class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return EMPTY;
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return EMPTY;
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return EMPTY;
	};

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
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
				MockComponent({ selector: 'ansyn-overlay-status', inputs: [] }),
				MockComponent({ selector: 'ansyn-overlays-loader', inputs: [] })
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

