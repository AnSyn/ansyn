import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { LogoPanelComponent } from './logo-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { StatusBarConfig } from '../../models/statusBar.config';
import { MenuConfig, ResetAppAction } from '@ansyn/menu';
import { ComponentVisibilityService } from '../../../../app-providers/component-visibility.service';
import { MockCompoentnService } from '../../../core/test/mock-compoentn-service';

describe('LogoPanelComponent', () => {
	let component: LogoPanelComponent;
	let fixture: ComponentFixture<LogoPanelComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LogoPanelComponent],
			imports: [StoreModule.forRoot({
				[statusBarFeatureKey]: StatusBarReducer,
				[mapFeatureKey]: MapReducer
			}),
				TranslateModule.forRoot()],
			providers: [
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				},
				{
					provide: MenuConfig,
					useValue: {}
				},
				{
					provide: ComponentVisibilityService,
					useClass: MockCompoentnService
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(LogoPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('reset app will dispatch ResetAppAction', () => {
		spyOn(store, 'dispatch');
		component.resetApp();
		expect(store.dispatch).toHaveBeenCalledWith(new ResetAppAction());
	});
});
