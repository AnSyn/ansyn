import { async, ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { LoggerService } from '../../../core/services/logger.service';
import { casesConfig } from '../../../menu-items/cases/services/cases.service';
import { MultipleOverlaysSourceProvider } from '../../../overlays/services/multiple-source-provider';
import { OverlaysConfig } from '../../../overlays/services/overlays.service';
import { StatusBarConfig } from '../../models/statusBar.config';
import { SearchPanelComponent } from '../search-panel/search-panel.component';

import { AdvancedSearchComponent } from './advanced-search.component';
import { OverlaySourceProviderMock } from './overlay-source-provider.mock';
import { IAdvancedSearchParameter } from '../../models/statusBar-config.model';
import { MockComponent } from '../../../core/test/mock-component';
import { fourViewsConfig } from '../../../overlays/models/overlay.model';

describe('AdvancedSearchComponent', () => {
	let component: AdvancedSearchComponent;
	let fixture: ComponentFixture<AdvancedSearchComponent>;
	let store: Store<any>;
	let parent: SearchPanelComponent;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [
				AdvancedSearchComponent,
				SearchPanelComponent,
				MockComponent({
					selector: 'ansyn-combo-table',
					inputs: ['isLine', 'isFullSize', 'selected', 'contentTitle'],
					outputs: ['selectedItemsArray']
				}),
				MockComponent({
					selector: 'ansyn-combo-table-option',
					inputs: ['value']
				}),
				MockComponent({
					selector: 'ngx-slider',
					inputs: ['value', 'highValue', 'options']
				})
			],
			providers: [
				TranslateService,
				{
					provide: MultipleOverlaysSourceConfig,
					useValue: {
						indexProviders: {
							OPEN_AERIAL: {
								dataInputFiltersConfig: {
									children: []
								}
							}
						}
					}
				},
				{
					provide: SearchPanelComponent,
					useValue: {
						close: () => {}
					}
				},
				{
					provide: casesConfig,
					useValue: {
						schema: null,
						defaultCase: {
							id: 'defaultCaseId',
							state: {
								advancedSearchParameters: {
									resolution: {
										lowValue: 0,
										highValue: 0
									}
								}
							}
						}
					}
				},
				{
					provide: OverlaysConfig,
					useValue: {}
				},
				{
					provide: fourViewsConfig,
					useValue: {
						active: false
					}
				},
				{
					provide: StatusBarConfig,
					useValue: {}
				},
				{ provide: MultipleOverlaysSourceProvider, useClass: OverlaySourceProviderMock },
				{ provide: LoggerService, useValue: {} },


			],
			imports: [StoreModule.forRoot({}), TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store, SearchPanelComponent], (_store: Store<any>, _parent: SearchPanelComponent) => {
		store = _store;
		parent = _parent;
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AdvancedSearchComponent);
		component = fixture.componentInstance;
		component.selectedAdvancedSearchParameters = {
			resolution: {
				lowValue: 0,
				highValue: 0
			}
		}
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('isValid()', () => {
		let params: IAdvancedSearchParameter;

		beforeEach(() => {
			params = {
				sensors: [],
				types: [],
				registeration: []
			};
		});

		it('should return false if all search parameters are empty', () => {
			expect(component.isValid(params)).toBeFalsy();
		})

		it('should return true if some search parameters are not empty', () => {
			params.types = ['shmulik'];
			expect(component.isValid(params)).toBeTruthy();
		})
	});

	describe('search()', () => {
		it('should trigger an error message if parameters are missing', () => {
			spyOn(component, 'isValid').and.returnValue(false);
			component.showMessage = false;
			component.search();
			expect(component.showMessage).toBeTruthy();
		});

		it('should trigger a search if parameters are valid', () => {
			spyOn(component, 'isValid').and.returnValue(true);
			spyOn(store, 'dispatch');
			spyOn(parent, 'close');
			component.search();
			expect(store.dispatch).toHaveBeenCalled();
			expect(parent.close).toHaveBeenCalled();
		});

	})
});
