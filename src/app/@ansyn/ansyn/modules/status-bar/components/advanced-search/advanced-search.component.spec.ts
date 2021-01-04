import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';
import { casesConfig } from '../../../menu-items/cases/services/cases.service';
import { SearchPanelComponent } from '../search-panel/search-panel.component';

import { AdvancedSearchComponent } from './advanced-search.component';

	describe('AdvancedSearchComponent', () => {
		let component: AdvancedSearchComponent;
		let fixture: ComponentFixture<AdvancedSearchComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ AdvancedSearchComponent, SearchPanelComponent ],
			providers: [
					{
						provide: MultipleOverlaysSourceConfig,
						useValue: {
							indexProviders: {
								Truthy: { }
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
									defaultAdvancedSearchParameters: {
										resolution: {
											lowValue: 0,
											highValue: 0
										}
									}
								}
							} 
						} 
					},
			],
			imports: [StoreModule.forRoot({})]
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
