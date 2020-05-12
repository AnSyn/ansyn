import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersPanelComponent } from './filters-panel.component';
import { MockComponent } from '../../../core/test/mock-component';
import { filtersFeatureKey, FiltersReducer } from '../../../filters/reducer/filters.reducer';
import { StoreModule } from '@ngrx/store';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';
import { TranslateModule } from '@ngx-translate/core';
import { StatusBarConfig } from '../../models/statusBar.config';
import { filtersConfig } from '../../../filters/services/filters.service';

const FILTERS = [
	{
		modelName: 'filter1'
	},
	{
		modelName: 'filter2'
	}
];
const mockfilterContainer = MockComponent({selector: 'ansyn-filter-container', inputs: ['filter']});
const ansynComboTrigger = MockComponent({
	selector: 'button[ansynComboBoxTrigger]',
	inputs: ['isActive', 'render', 'disabled', 'withArrow'],
});
describe('FiltersPanelComponent', () => {
	let component: FiltersPanelComponent;
	let fixture: ComponentFixture<FiltersPanelComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FiltersPanelComponent,
				mockfilterContainer,
				ansynComboTrigger],
			imports: [
				StoreModule.forRoot({[filtersFeatureKey]: FiltersReducer}),
				TranslateModule.forRoot()
			],
			providers: [
				ClickOutsideService,
				{
					provide: StatusBarConfig,
					useValue: {
						filters: ['filter1']
					}
				},
				{
					provide: filtersConfig,
					useValue: {
						filters: FILTERS
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FiltersPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('on Click on favorite should close all filters', () => {
		fixture.nativeElement.querySelector('.favorites').click();
		FILTERS.forEach( filter => {
			expect(component.expand[filter.modelName]).toBeFalsy();
		})
	})


});
