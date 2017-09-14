import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { AnsynComponent } from './ansyn.component';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { ToolsReducer } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { cloneDeep as _cloneDeep } from 'lodash';
import { Case } from '@ansyn/core/models/case.model';
import { AddCaseSuccessAction, SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Subject } from 'rxjs/Subject';
import { MapReducer } from '@ansyn/map-facade/reducers/map.reducer';

describe('AnsynComponent', () => {
	let component: AnsynComponent;
	let fixture: ComponentFixture<AnsynComponent>;
	let store: Store<any>;
	let handler: Subject<any>;

	const mock_menu = MockComponent({ selector: 'ansyn-menu' });
	const mock_status = MockComponent({
		selector: 'ansyn-status-bar',
		inputs: ['selected_case_name', 'overlay', 'isFavoriteOverlayDisplayed']
	});
	const mock_overlays_container = MockComponent({ selector: 'ansyn-overlays-container' });
	const mock_empty_component = MockComponent({ selector: 'ansyn-empty' });
	const mock_imagery_view = MockComponent({ selector: 'ansyn-imageries-manager' });

	const cases: Case[] = [{
		id: 'tmp',
		state: {
			favoritesOverlays: [],
			time: { type: '', from: new Date(), to: new Date() },
			region: {
				type: 'Polygon',
				coordinates: [
					[
						[-64.73, 32.31],
						[-80.19, 25.76],
						[-66.09, 18.43],
						[-64.73, 32.31]
					]
				]
			},
			maps: {
				data: [
					{
						id: 'imagery1',
						data: {
							position: {
								zoom: 1, center: 2, boundingBox: { test: 1 }
							},
							isHistogramActive: false,
							overlay: { id: 'overlayId1' }
						}
					},
					{ id: 'imagery2', data: { position: { zoom: 3, center: 4 } } },
					{ id: 'imagery3', data: { position: { zoom: 5, center: 6 } } }
				],
				active_map_id: 'imagery1'
			}
		} as any
	}];


	beforeEach(() => {

		TestBed.configureTestingModule({
			declarations: [
				AnsynComponent,
				mock_imagery_view,
				mock_menu,
				mock_overlays_container,
				mock_status,
				mock_imagery_view,
				mock_empty_component
			],
			imports: [
				RouterTestingModule,
				StoreModule.provideStore({
					status_bar: StatusBarReducer,
					cases: CasesReducer,
					overlays: OverlayReducer,
					tools: ToolsReducer,
					map: MapReducer
				})]
		})
			.compileComponents();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		store.dispatch(new AddCaseSuccessAction(cases[0]));
		store.dispatch(new SelectCaseByIdAction('tmp'));
	}));

	beforeEach(() => {

		fixture = TestBed.createComponent(AnsynComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		Object.defineProperty(component, 'selected_case$', {
			get: () => {
			}
		});

		handler = new Subject();
		spyOnProperty(component, 'selected_case$', 'get').and.callFake(type => {
			return handler;
		});
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	describe('isFavoriteOverlay', () => {

		it('check isFavoriteOverlay overlay is not favorite', () => {
			component.isFavoriteOverlay$.subscribe(isFavorite => {
				expect(isFavorite).toBe(false);
			});
			const selectedCase = _cloneDeep(cases[0]);
			selectedCase.state.favoritesOverlays.push('overlayId2');
			handler.next({ selected_case: selectedCase });

		});

		it('check isFavoriteOverlay truthy value', () => {
			component.isFavoriteOverlay$.subscribe(isFavorite => {
				expect(isFavorite).toBe(true);
			});
			const selectedCase = _cloneDeep(cases[0]);
			selectedCase.state.favoritesOverlays.push('overlayId1');
			handler.next({ selected_case: selectedCase });
		});

		it('check isFavoriteOverlay falsy value', () => {
			component.isFavoriteOverlay$.subscribe(isFavorite => {
				expect(isFavorite).toBe(false);
			});
			handler.next({ selected_case: _cloneDeep(cases[0]) });
		});
	});
});
