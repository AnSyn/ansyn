import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { WelcomeNotificationComponent } from './welcome-notification.component';
import { Store, StoreModule } from '@ngrx/store';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { CoreModule } from '@ansyn/core/core.module';
import { EffectsModule } from '@ngrx/effects';
import { ICoreState } from '@ansyn/core/reducers/core.reducer';
import { SetIsAfterLoginFlagAction } from '@ansyn/core';

describe('WelcomeNotificationComponent', () => {
	let component: WelcomeNotificationComponent;
	let fixture: ComponentFixture<WelcomeNotificationComponent>;
	let store: Store<any>;

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

	beforeEach(inject([Store], (_store: Store<ICoreState>) => {
		store = _store;
	}));

	describe('invoke when isAfterLogin is false', () => {
		beforeEach(() => {
			store.next(new SetIsAfterLoginFlagAction(false));
			fixture = TestBed.createComponent(WelcomeNotificationComponent);
			component = fixture.componentInstance;
			spyOn(component.elem.nativeElement, 'focus');
			fixture.detectChanges();
		});

		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('tabindex attribute should return zero', () => {
			expect(component.tabindex).toEqual(0);
		});

		it('the element.focus() should not be called, during the component`s init', async(() => {
			fixture.whenStable().then(() => {
				expect(component.elem.nativeElement.focus).not.toHaveBeenCalled();
			});
		}));
	});

	describe('invoke when isAfterLogin is true', () => {
		beforeEach(() => {
			store.next(new SetIsAfterLoginFlagAction(true));
			fixture = TestBed.createComponent(WelcomeNotificationComponent);
			component = fixture.componentInstance;
			spyOn(component.elem.nativeElement, 'focus');
			fixture.detectChanges();
		});

		it('the element.focus() should be called, during the component`s init', async(() => {
			fixture.whenStable().then(() => {
				expect(component.elem.nativeElement.focus).toHaveBeenCalled();
			});
		}));
	});

});
