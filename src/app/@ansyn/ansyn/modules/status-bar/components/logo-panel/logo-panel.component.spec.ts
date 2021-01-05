import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoPanelComponent } from './logo-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { StatusBarConfig } from '../../models/statusBar.config';

describe('DisplayPanelComponent', () => {
	let component: LogoPanelComponent;
	let fixture: ComponentFixture<LogoPanelComponent>;

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
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LogoPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
