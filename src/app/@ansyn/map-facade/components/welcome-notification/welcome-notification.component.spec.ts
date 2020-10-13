import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { WelcomeNotificationComponent } from './welcome-notification.component';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { SetWasWelcomeNotificationShownFlagAction } from '../../actions/map.actions';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { TranslateModule } from '@ngx-translate/core';

describe('WelcomeNotificationComponent', () => {
	let component: WelcomeNotificationComponent;
	let fixture: ComponentFixture<WelcomeNotificationComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer }),
				EffectsModule.forRoot([]),
				TranslateModule.forRoot()
			],
			declarations: [WelcomeNotificationComponent],
			providers: [{
				provide: mapFacadeConfig,
				useValue: <any>{ welcomeNotification: { headerText: 'hhh', mainText: 'mmm' } }
			}]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	describe('invoke when wasWelcomeNotificationShown is false', () => {
		beforeEach(() => {
			store.next(new SetWasWelcomeNotificationShownFlagAction(false));
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

		it('the element.focus() should be called, during the component`s init', async(() => {
			fixture.whenStable().then(() => {
				expect(component.elem.nativeElement.focus).toHaveBeenCalled();
			});
		}));

		describe('onBlur()', () => {
			beforeEach(() => {
				spyOn(window, 'setTimeout').and.callFake(<any>(fn => {
					(<any>fn)();
					return 0;
				}));
				spyOn(store, 'dispatch');
				fixture.debugElement.triggerEventHandler('blur', null);
				fixture.detectChanges();
			});
			it('should call store.dispatch', () => {
				expect(store.dispatch).toHaveBeenCalled();
			});
		});
	});

	describe('invoke when wasWelcomeNotificationShown is true', () => {
		beforeEach(() => {
			store.next(new SetWasWelcomeNotificationShownFlagAction(true));
			fixture = TestBed.createComponent(WelcomeNotificationComponent);
			component = fixture.componentInstance;
			spyOn(component.elem.nativeElement, 'focus');
			fixture.detectChanges();
		});

		it('the element.focus() should not be called, during the component`s init', async(() => {
			fixture.whenStable().then(() => {
				expect(component.elem.nativeElement.focus).not.toHaveBeenCalled();
			});
		}));
	});

});
