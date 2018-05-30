import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { Store, StoreModule } from '@ngrx/store';
import { IStatusBarState, statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { ExpandAction, UpdateStatusFlagsAction } from '../../actions/status-bar.actions';
import { StatusBarModule } from '../../status-bar.module';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { StatusBarConfig } from '../../models/statusBar.config';
import { statusBarFlagsItemsEnum } from '../../models/status-bar-flag-items.model';
import { GoAdjacentOverlay } from '@ansyn/core/actions/core.actions';
import { comboBoxesOptions, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { ALERTS } from '@ansyn/core/alerts/alerts.model';
import { ImageryStatusComponent } from '@ansyn/core/components/imagery-status/imagery-status.component';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { coreFeatureKey, CoreReducer } from '@ansyn/core/reducers/core.reducer';

describe('StatusBarComponent', () => {
	let component: StatusBarComponent;
	let fixture: ComponentFixture<StatusBarComponent>;
	let store: Store<IStatusBarState>;
	const mockImageryStatusComponent = MockComponent({ selector: 'ansyn-imagery-status', inputs: ['overlay', 'active', 'mapId'], outputs: ['backToWorldView']})
	const mockSelectedCaseBarComponent = MockComponent({ selector: 'ansyn-selected-case-bar', inputs: ['selectedCaseName'] });
	const mockComboBoxes = MockComponent({ selector: 'ansyn-combo-boxes' });
	const mockNavigationBar = MockComponent({ selector: 'ansyn-navigation-bar' });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [statusBarFeatureKey]: StatusBarReducer, [coreFeatureKey]: CoreReducer }), EffectsModule.forRoot([])],
			declarations: [StatusBarComponent,
				/* mock */
				mockImageryStatusComponent,
				mockSelectedCaseBarComponent,
				mockComboBoxes,
				mockNavigationBar
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		fixture = TestBed.createComponent(StatusBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

});


