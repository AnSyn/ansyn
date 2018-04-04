import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { WelcomeNotificationComponent } from './welcome-notification.component';
import { Store, StoreModule } from '@ngrx/store';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { CoreModule } from '@ansyn/core/core.module';
import { EffectsModule } from '@ngrx/effects';
import { ICoreState } from '@ansyn/core/reducers/core.reducer';
import { SetIsAfterLoginFlagAction } from '@ansyn/core';

fdescribe('WelcomeNotificationComponent', () => {
	let component: WelcomeNotificationComponent;
	let fixture: ComponentFixture<WelcomeNotificationComponent>;
	let store: Store<any>;

	beforeEach(inject([Store], (_store: Store<ICoreState>) => {
		store = _store;
		store.next(new SetIsAfterLoginFlagAction(true));
	}));

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

	it('element should be focused', () => {

	});

	// it('if isAfterLogin is true, bring the element to focus', () => {
	// 	spyOn(component.elem.nativeElement, 'focus');
	// 	(<Store<ICoreState>>component.store$.select(coreStateSelector)).next(new SetIsAfterLoginFlagAction(true));
	// 	expect(component.elem.nativeElement.focus).toHaveBeenCalled();
	// });

});
