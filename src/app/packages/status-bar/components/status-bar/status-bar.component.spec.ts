import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { Store, StoreModule } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import {
	ChangeLayoutAction, ExpandAction, GoNextAction, GoPrevAction,
	UpdateStatusFlagsAction
} from '../../actions/status-bar.actions';
import { StatusBarModule } from '../../status-bar.module';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { StatusBarConfig } from '../../models/index';
import { statusBarFlagsItems } from '@ansyn/status-bar';
import { CoreConfig } from '@ansyn/core';

describe('StatusBarComponent', () => {
	let component: StatusBarComponent;
	let fixture: ComponentFixture<StatusBarComponent>;
	let store: Store<IStatusBarState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([]), StatusBarModule],
			providers: [{ provide: LoggerConfig, useValue: {} },
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				},
				{
					provide: CoreConfig,
					useValue: { errors: {} }
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		fixture = TestBed.createComponent(StatusBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('layoutSelectChange call store$$.dispatch with ChangeLayoutAction', () => {
		spyOn(store, 'dispatch');
		component.layoutSelectChange(5);
		expect(store.dispatch).toHaveBeenCalledWith(new ChangeLayoutAction(5));
	});


	it('eye indicator should be active', () => {
		let result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(true);
		component.flags.set(statusBarFlagsItems.pinPointIndicator, false);
		fixture.detectChanges();
		result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(false);
	});

	it('check click on pinPoint flags', () => {
		spyOn(store, 'dispatch');
		fixture.nativeElement.querySelector('.edit-pinpoint').click();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch }));

		fixture.nativeElement.querySelector('.eye-button').click();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointIndicator }));
	});

	describe('clicks', () => {
		it('clickGoPrev should dispatch action GoPrevAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickGoPrev();
			expect(component.store.dispatch).toHaveBeenCalledWith(new GoPrevAction());
		});
		it('clickGoNext should dispatch action GoNextAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickGoNext();
			expect(component.store.dispatch).toHaveBeenCalledWith(new GoNextAction());
		});
		it('clickExpand should dispatch action ExpandAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickExpand();
			expect(component.store.dispatch).toHaveBeenCalledWith(new ExpandAction());
		});
	});

	[{ k: 39, n: 'goNextActive', f: 'clickGoNext' }, { k: 37, n: 'goPrevActive', f: 'clickGoPrev' }].forEach(key => {
		it(`onkeyup should call ${key.n} when keycode = "${key.k}"`, () => {
			spyOn(component, <'clickGoNext' | 'clickGoPrev'>key.f);
			expect(component[key.n]).toEqual(false);
			const $event = {
				which: key.k,
				currentTarget: { document: { activeElement: {} } }
			};
			component.onkeydown(<any>$event);
			expect(component[key.n]).toEqual(true);

			component.onkeyup(<any>$event);
			expect(component[key.n]).toEqual(false);
			expect(component[key.f]).toHaveBeenCalled();
		});
	});
});
