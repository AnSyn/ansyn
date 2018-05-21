import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { Store, StoreModule } from '@ngrx/store';
import { IStatusBarState, StatusBarInitialState, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import { ExpandAction, UpdateStatusFlagsAction } from '../../actions/status-bar.actions';
import { StatusBarModule } from '../../status-bar.module';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { StatusBarConfig } from '../../models/statusBar.config';
import { statusBarFlagsItemsEnum } from '../../models/status-bar-flag-items.model';
import { GoAdjacentOverlay } from '@ansyn/core/actions/core.actions';
import { comboBoxesOptions, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { ALERTS } from '@ansyn/core/alerts/alerts.model';
import { TreeviewModule } from 'ngx-treeview';
import { casesConfig, CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { UrlSerializer } from '@angular/router';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Case, CaseTimeState } from '@ansyn/core/models/case.model';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { OverlaysCriteria } from '@ansyn/core/models/overlay.model';
import { provideMockActions } from '@ngrx/effects/testing';

describe('StatusBarComponent', () => {
	let component: StatusBarComponent;
	let fixture: ComponentFixture<StatusBarComponent>;
	let store: Store<any>;
	let actions: Observable<any>;
	let statusBarState: IStatusBarState;
	const time: CaseTimeState = { type: 'absolute', from: new Date(0), to: new Date(0) };

	let searchParams: OverlaysCriteria = {
		region: {
			'type': 'Polygon',
			'coordinates': [
				[
					[
						-14.4140625,
						59.99349233206085
					],
					[
						37.96875,
						59.99349233206085
					],
					[
						37.96875,
						35.915747419499695
					],
					[
						-14.4140625,
						35.915747419499695
					],
					[
						-14.4140625,
						59.99349233206085
					]
				]
			]
		},
		time: {
			type: 'absolute',
			from: new Date(2020),
			to: new Date()
		}
	};
	const caseItem: Case[] = [{
		id: '1',
		name: 'name',
		owner: 'owner',
		creationTime: new Date(),
		lastModified: new Date(),
		state: {
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
							position: { zoom: 1, center: 2 },
							isAutoImageProcessingActive: true,
							overlay: 'overlay'
						}
					}
				],
				activeMapId: 'imagery1',
				layout: 'layout6'
			},
			overlaysManualProcessArgs: {
				'overlay_123': { Contrast: 50, Brightness: 20 }
			}
		} as any
	}];
	const casesState = { selectedCase: caseItem, cases: [caseItem], time };
	const coreState = { ...coreInitialState, searchParams };

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([]), StatusBarModule, TreeviewModule.forRoot()],
			providers: [
				CasesService,
				HttpClient,
				HttpHandler,
				UrlSerializer,
				{ provide: CoreConfig, useValue: {} },
				{ provide: LoggerConfig, useValue: {} },
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {}, dataInputFiltersConfig: { filters: [] } }
				},
				{
					provide: ORIENTATIONS,
					useValue: comboBoxesOptions.orientations
				},
				{
					provide: TIME_FILTERS,
					useValue: comboBoxesOptions.timeFilters
				},
				{
					provide: GEO_FILTERS,
					useValue: comboBoxesOptions.geoFilters
				},
				{ provide: ALERTS, useValue: [] },
				{ provide: casesConfig, useValue: { schema: null } },
				provideMockActions(() => actions),
				{
					provide: CasesService,
					useValue: {
						defaultCase: { id: 'defualtId' }
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store) => {
		store = _store;
		statusBarState = cloneDeep(StatusBarInitialState);
		const fakeStore = new Map<any, any>([
			[casesStateSelector, casesState],
			[coreStateSelector, coreState],
			[statusBarStateSelector, statusBarState]
		]);

		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(StatusBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});


	it('should be created', () => {
		expect(component).toBeTruthy();
	});


	fit('eye indicator should be active', () => {
		let result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(true);
		component.flags.set(statusBarFlagsItemsEnum.geoFilterIndicator, false);
		fixture.detectChanges();
		result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(false);
	});

	describe('check click on pinPoint flags', () => {
		beforeEach(() => {
			spyOn(store, 'dispatch');
		});

		it('edit-pinpoint', () => {
			fixture.nativeElement.querySelector('.edit-pinpoint').click();
			fixture.detectChanges();
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch }));
		});
		it('button-eye', () => {
			fixture.nativeElement.querySelector('.eye-button').click();
			fixture.detectChanges();
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterIndicator }));
		});
	});

	describe('clicks', () => {
		it('clickGoPrev should dispatch action GoPrevAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickGoAdjacent(false);
			expect(component.store.dispatch).toHaveBeenCalledWith(new GoAdjacentOverlay({ isNext: false }));
		});
		it('clickGoNext should dispatch action GoNextAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickGoAdjacent(true);
			expect(component.store.dispatch).toHaveBeenCalledWith(new GoAdjacentOverlay({ isNext: true }));
		});
		it('clickExpand should dispatch action ExpandAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickExpand();
			expect(component.store.dispatch).toHaveBeenCalledWith(new ExpandAction());
		});
	});

	[{ k: 39, n: 'goNextActive', f: 'clickGoAdjacent' }, {
		k: 37,
		n: 'goPrevActive',
		f: 'clickGoAdjacent'
	}].forEach(key => {
		it(`onkeyup should call ${key.n} when keycode = "${key.k}"`, () => {
			spyOn(component, <'clickGoAdjacent'>key.f);
			expect(component[key.n]).toEqual(false);
			const $event = {
				which: key.k,
				currentTarget: { document: { activeElement: {} } }
			};
			component.onkeydown(<any>$event);
			expect(component[key.n]).toEqual(true);

			component.onkeyup(<any>$event);
			expect(component[key.n]).toEqual(false);
			expect(component[key.f]).toHaveBeenCalled();
		});
	});
});


