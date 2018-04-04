import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeNotificationComponent } from './welcome-notification.component';
import { StoreModule } from '@ngrx/store';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { CoreModule } from '@ansyn/core/core.module';
import { EffectsModule } from '@ngrx/effects';

fdescribe('WelcomeNotificationComponent', () => {
	let component: WelcomeNotificationComponent;
	let fixture: ComponentFixture<WelcomeNotificationComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({}),
				EffectsModule.forRoot([]),
				CoreModule
			],
			declarations: [WelcomeNotificationComponent],
			providers: [{
				provide: mapFacadeConfig,
				useValue: <IMapFacadeConfig> {welcomeNotification: {headerText: 'hhh', mainText: 'mmm'}}
			}]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(WelcomeNotificationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('tabindex attribute should return zero', () => {
		expect(component.tabindex).toEqual(0);
	});

});
