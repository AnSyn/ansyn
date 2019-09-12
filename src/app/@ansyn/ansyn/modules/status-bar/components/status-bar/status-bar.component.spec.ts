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
	let store: Store<IStatusBarState>;
	const mockImageryStatusComponent = MockComponent({
		selector: 'ansyn-imagery-status',
		inputs: ['mapId'],
		outputs: []
	});
	const mockSelectedCaseBarComponent = MockComponent({
		selector: 'ansyn-popover',
		inputs: ['text', 'icon']
	});
	const mockComboBoxes = MockComponent({ selector: 'ansyn-combo-boxes' });
	const mockNavigationBar = MockComponent({ selector: 'ansyn-navigation-bar' });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({
				[statusBarFeatureKey]: StatusBarReducer,
				[mapFeatureKey]: MapReducer
			}), EffectsModule.forRoot([]),
			TranslateModule.forRoot()
			],
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


