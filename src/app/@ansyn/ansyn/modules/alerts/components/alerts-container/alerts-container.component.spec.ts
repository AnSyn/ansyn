import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EntryComponentDirective, MapFacadeModule, mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { ALERTS } from '../../alerts.model';
import { AlertsModule } from '../../alerts.module';

import { AlertsContainerComponent } from './alerts-container.component';
import { StoreModule } from '@ngrx/store';

describe('AlertsContainerComponent', () => {
	let component: AlertsContainerComponent;
	let fixture: ComponentFixture<AlertsContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AlertsContainerComponent],
			imports: [
				MapFacadeModule,
				StoreModule.forRoot({[mapFeatureKey]: MapReducer})],
			providers: [
				{ provide: ALERTS, useValue: [] },
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AlertsContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
