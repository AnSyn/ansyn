import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {AppModule} from "./app.module";
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { StoreModule, Store } from '@ngrx/store';
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { Case } from '@ansyn/core/models/case.model';
import { AddCaseSuccessAction, SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import '@ansyn/core/utils/clone-deep';
import { Subject } from 'rxjs/Subject';
import { cloneDeep } from "lodash";

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;
	let appComponent: AppComponent;
	let element: any;
	let handler: Subject<any>;

	const mock_menu = MockComponent({selector: 'ansyn-menu'});
	const mock_status = MockComponent({selector: 'ansyn-status-bar', inputs: ['selected_case_name', 'overlays_count', 'overlay', 'hide-overlay','isFavoriteOverlayDisplayed']});
	const mock_overlays_container = MockComponent({selector: 'ansyn-overlays-container'});
	const mock_imagery_view = MockComponent({selector: 'ansyn-imageries-manager', inputs: ['selected_layout', 'maps']});
	const mock_empty_component = MockComponent({selector: 'ansyn-empty'});

	const cases: Case[] = [{
		id: 'tmp',
		state: {
			favoritesOverlays: [],
			time: { type: '',from: new Date(), to: new Date()},
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
								zoom: 1, center: 2, boundingBox: {test: 1}
							},
							isHistogramActive: false,
							overlay: {id :'overlayId1'}
						}
					},
					{id: 'imagery2', data: {position: {zoom: 3, center: 4}}},
					{id: 'imagery3', data: {position: {zoom: 5, center: 6}}}
				],
				active_map_id: 'imagery1'
			}
		} as any
	}];
	let store: Store<any> ;

	beforeEach(async(() => {

		TestBed.configureTestingModule({
			imports:[
				RouterTestingModule,
				StoreModule.provideStore({
					status_bar: StatusBarReducer,
					cases: CasesReducer,
					overlays : OverlayReducer
				})
			],
			declarations:[
				AppComponent,
				mock_menu,
				mock_overlays_container,
				mock_status,
				mock_imagery_view,
				mock_empty_component

			]
		}).compileComponents();
	}));
	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		store.dispatch(new AddCaseSuccessAction(cases[0]));
		store.dispatch(new SelectCaseByIdAction('tmp'));
		handler = new Subject();
		spyOn(store,'select').and.callFake( type => {
			return handler;
		});
	}));

	beforeEach(()=>{
		fixture = TestBed.createComponent(AppComponent);
		appComponent = fixture.debugElement.componentInstance;
		element = fixture.debugElement.nativeElement;
	});

	it('should create the app', async(() => {
		expect(appComponent).toBeTruthy();
	}));

	it("check favoritesOverlays falsy value",() => {

		appComponent.favoritesOverlays$.subscribe( isFavorite => {
			expect(isFavorite).toBe(false);
		});

		handler.next({selected_case: cloneDeep(cases[0])});

	});

	it("check favoritesOverlays truthy value",() => {

		appComponent.favoritesOverlays$.subscribe( isFavorite => {
			expect(isFavorite).toBe(true);
		});

		const selectedCase = cloneDeep(cases[0]);
		selectedCase.state.favoritesOverlays.push('overlayId1');
		handler.next({ selected_case: selectedCase});

	});

	it("check favoritesOverlays overlay is not favorite",() => {

		appComponent.favoritesOverlays$.subscribe( isFavorite => {
			expect(isFavorite).toBe(false);
		});

		const selectedCase = cloneDeep(cases[0]);
		selectedCase.state.favoritesOverlays.push('overlayId2');
		handler.next({ selected_case: selectedCase});

	});

});
