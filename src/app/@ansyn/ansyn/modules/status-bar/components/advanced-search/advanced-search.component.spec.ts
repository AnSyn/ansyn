import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
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

describe('AdvancedSearchComponent', () => {
	let component: AdvancedSearchComponent;
	let fixture: ComponentFixture<AdvancedSearchComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AdvancedSearchComponent, SearchPanelComponent],
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
					useValue: {}
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
});
