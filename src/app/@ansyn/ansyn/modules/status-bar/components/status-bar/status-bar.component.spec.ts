import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { MockComponent } from '../../../core/test/mock-component';
import { TranslateModule } from '@ngx-translate/core';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';

describe('StatusBarComponent', () => {
	let component: StatusBarComponent;
	let fixture: ComponentFixture<StatusBarComponent>;
	const mockSearchPanel = MockComponent({ selector: 'ansyn-search-panel' });
	const mockCasePanel = MockComponent({ selector: 'ansyn-cases' });
	const mockFiltersPanel = MockComponent( {selector: 'ansyn-filters-panel'});
	const mockDisplayPanel = MockComponent( {selector: 'ansyn-display-panel'});
	const mockLogoPanel = MockComponent( {selector: 'ansyn-logo-panel', inputs: ['version']});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [StatusBarComponent,
				mockSearchPanel,
				mockCasePanel,
				mockFiltersPanel,
				mockDisplayPanel,
				mockLogoPanel
			],
			providers: [
				{
					provide: COMPONENT_MODE,
					useValue: false
				}
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


