import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { CasePanelComponent } from './case-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import {
	StatusBarReducer,
	statusBarFeatureKey,
	IStatusBarState,
	selectComboBoxesProperties
} from '../../reducers/status-bar.reducer';
import { CopySnapshotShareLinkAction } from '../../actions/status-bar.actions';
import { cold } from 'jasmine-marbles';
import { StatusBarConfig } from '../../models/statusBar.config';
import { selectLayout } from '@ansyn/map-facade';
import { casesFeatureKey, CasesReducer, selectSelectedCase } from '../../../menu-items/cases/reducers/cases.reducer';
import { of } from 'rxjs';
import { OverlaysEffects } from '../../../overlays/effects/overlays.effects';
import { OverlaysConfig } from '../../../overlays/services/overlays.service';
import { MultipleOverlaysSourceConfig } from '../../../core/models/multiple-overlays-source-config';

describe('CasePanelComponent', () => {
	let component: CasePanelComponent;
	let fixture: ComponentFixture<CasePanelComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CasePanelComponent],
			imports: [TranslateModule.forRoot(),
			EffectsModule.forRoot([OverlaysEffects]),
			StoreModule.forRoot({
				[statusBarFeatureKey]: StatusBarReducer,
				[casesFeatureKey]: CasesReducer
			})],
			providers: [
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				},
				{
					provide: OverlaysConfig,
					useValue: {
						limit: 500
					}
				},
				{
					provide: MultipleOverlaysSourceConfig,
					useValue: {
						defaultProvider: {},
						indexProviders: {
						}
					}
				},
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasePanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		store = _store;
		const mockStore = new Map<any, any>([
			[selectSelectedCase, 'default case'],
		]);

		spyOn(store, 'select').and.callFake(type => of(mockStore.get(type)));
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('click on share should fire CopySnapshotShareLinkAction action', () => {
		spyOn(store, 'dispatch');
		fixture.nativeElement.querySelector('.share').click();
		expect(store.dispatch).toHaveBeenCalledWith(new CopySnapshotShareLinkAction());
	});
});
