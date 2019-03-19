import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SliderCheckboxComponent } from '@ansyn/core';
import { StoreModule } from '@ngrx/store';
import { settingsFeatureKey, SettingsReducer } from '../reducers/settings.reducer';

describe('SettingsComponent', () => {
	let component: SettingsComponent;
	let fixture: ComponentFixture<SettingsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[settingsFeatureKey]: SettingsReducer
				})
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
