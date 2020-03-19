import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { Store, StoreModule } from '@ngrx/store';
import { IStatusBarState, statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MockComponent } from '../../../core/test/mock-component';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { TranslateModule } from '@ngx-translate/core';

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
	const mockNavigationBar = MockComponent({ selector: 'ansyn-navigation-bar' });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [StatusBarComponent,
				/* mock */
				mockSelectedCaseBarComponent,
				mockSearchPanel,
				mockDisplayPanel,
				mockCasePanel,
				mockNavigationBar
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


