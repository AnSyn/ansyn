import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { StoreModule } from '@ngrx/store';
import { settingsFeatureKey, SettingsReducer } from '../reducers/settings.reducer';
import { SliderCheckboxComponent } from '../../../core/forms/slider-checkbox/slider-checkbox.component';
import { TranslateModule } from '@ngx-translate/core';

describe('SettingsComponent', () => {
	let component: SettingsComponent;
	let fixture: ComponentFixture<SettingsComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[settingsFeatureKey]: SettingsReducer
				}),
				TranslateModule.forRoot()
			],
			declarations: [SettingsComponent, SliderCheckboxComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SettingsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
