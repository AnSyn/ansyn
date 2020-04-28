import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { MockComponent } from '../../../core/test/mock-component';
import { TranslateModule } from '@ngx-translate/core';
import { FiltersModule } from '../../../filters/filters.module';

describe('StatusBarComponent', () => {
	let component: StatusBarComponent;
	let fixture: ComponentFixture<StatusBarComponent>;
	const mockSelectedCaseBarComponent = MockComponent({
		selector: 'ansyn-popover',
		inputs: ['text', 'icon']
	});
	const mockSearchPanel = MockComponent({ selector: 'ansyn-search-panel' });
	const mockDisplayPanel = MockComponent({ selector: 'ansyn-display-panel' });
	const mockCasePanel = MockComponent({ selector: 'ansyn-case-panel' });
	const mockFiltersPanel = MockComponent( {selector: 'ansyn-filters-panel'});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [StatusBarComponent,
				/* mock */
				mockSelectedCaseBarComponent,
				mockSearchPanel,
				mockDisplayPanel,
				mockCasePanel,
				mockFiltersPanel
			]
		})
			.compileComponents();
	}));

	beforeEach( () => {
		fixture = TestBed.createComponent(StatusBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

});


