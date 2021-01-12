import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { casesConfig } from '../../../menu-items/cases/services/cases.service';
import { SearchPanelComponent } from '../search-panel/search-panel.component';

import { AdvancedSearchComponent } from './advanced-search.component';

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
				}
			],
			imports: [StoreModule.forRoot({}), TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AdvancedSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
