import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { AnsynComponent } from './ansyn.component';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { Store, StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { Case } from '@ansyn/core/models/case.model';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { initialMenuState, menuStateSelector } from '@ansyn/menu/reducers/menu.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';

describe('AnsynComponent', () => {
	let component: AnsynComponent;
	let fixture: ComponentFixture<AnsynComponent>;
	let store: Store<any>;
	let handler: Subject<any>;

	const mockMenu = MockComponent({ selector: 'ansyn-menu', inputs: ['version'] });
	const mockToast = MockComponent({ selector: 'ansyn-toast', inputs: ['duration'] });
	const mockStatus = MockComponent({
		selector: 'ansyn-status-bar',
		inputs: ['selectedCaseName', 'overlay', 'isFavoriteOverlayDisplayed']
	});
	const mockOverlaysContainer = MockComponent({ selector: 'ansyn-overlays-container' });
	const mockEmptyComponent = MockComponent({ selector: 'ansyn-empty' });
	const mockImageryView = MockComponent({ selector: 'ansyn-imageries-manager' });

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
				activeMapId: 'imagery1'
			}
		} as any
	}];


	beforeEach(() => {

		TestBed.configureTestingModule({
			declarations: [
				AnsynComponent,
				mockImageryView,
				mockMenu,
				mockToast,
				mockOverlaysContainer,
				mockStatus,
				mockImageryView,
				mockEmptyComponent
			],
			imports: [
				RouterTestingModule,
				StoreModule.forRoot({})]
		}).compileComponents();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		handler = new Subject();
		const mockStore = new Map<any, any>([

			[casesStateSelector, handler],
			[toolsStateSelector, Observable.of({
				flags: new Map<string, any>()
			})],
			[mapStateSelector, Observable.of({
				mapsList: [
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
				activeMapId: 'imagery1'
			})],
			[menuStateSelector, Observable.of(initialMenuState)]
		]);


		spyOn(store, 'select').and.callFake(type => mockStore.get(type));


	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

});
