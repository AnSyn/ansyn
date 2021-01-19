import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { MockComponent } from '../../../core/test/mock-component';
import { TranslateModule } from '@ngx-translate/core';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';
import { ComponentVisibilityService } from '../../../../app-providers/component-visibility.service';
import { Store, StoreModule } from '@ngrx/store';
import { MockCompoentnService } from '../../../core/test/mock-compoentn-service';

describe('StatusBarComponent', () => {
	let component: StatusBarComponent;
	let fixture: ComponentFixture<StatusBarComponent>;
	let store: Store<any>;
	const mockSearchPanel = MockComponent({ selector: 'ansyn-search-panel' });
	const mockCasePanel = MockComponent({ selector: 'ansyn-cases' });
	const mockFiltersPanel = MockComponent( {selector: 'ansyn-filters-panel'});
	const mockDisplayPanel = MockComponent( {selector: 'ansyn-display-panel'});
	const mockLogoPanel = MockComponent( {selector: 'ansyn-logo-panel', inputs: ['version']});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), StoreModule.forRoot({})],
			declarations: [StatusBarComponent,
				mockSearchPanel,
				mockCasePanel,
				mockFiltersPanel,
				mockDisplayPanel,
				mockLogoPanel
			],
			providers: [
				{
					provide: ComponentVisibilityService,
					useClass: MockCompoentnService
				},
				{
					provide: COMPONENT_MODE,
					useValue: false
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(StatusBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

});


