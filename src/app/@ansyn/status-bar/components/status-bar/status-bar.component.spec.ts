import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { Store, StoreModule } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import {
	ExpandAction,
	UpdateStatusFlagsAction
} from '../../actions/status-bar.actions';
import { StatusBarModule } from '../../status-bar.module';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { StatusBarConfig } from '../../models/index';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar';
import { GoAdjacentOverlay } from '@ansyn/core';
import { comboBoxesOptions, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models';
import { ALERTS } from '@ansyn/core/alerts/alerts.model';

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
					provide: ORIENTATIONS,
					useValue: comboBoxesOptions.orientations
				},
				{
					provide: TIME_FILTERS,
					useValue: comboBoxesOptions.timeFilters
				},
				{
					provide: GEO_FILTERS,
					useValue: comboBoxesOptions.geoFilters
				},
				{ provide: ALERTS, useValue: [] }
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


	it('eye indicator should be active', () => {
		let result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(true);
		component.flags.set(statusBarFlagsItemsEnum.geoFilterIndicator, false);
		fixture.detectChanges();
		result = fixture.nativeElement.querySelector('.eye-button').classList.contains('active2');
		expect(result).toBe(false);
	});

	describe('check click on pinPoint flags', () => {
		beforeEach(() => {
			spyOn(store, 'dispatch');
		});

		it('edit-pinpoint', () => {
			fixture.nativeElement.querySelector('.edit-pinpoint').click();
			fixture.detectChanges();
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch }));
		});
		it('button-eye', () => {
			fixture.nativeElement.querySelector('.eye-button').click();
			fixture.detectChanges();
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterIndicator }));
		});
	});

	describe('clicks', () => {
		it('clickGoPrev should dispatch action GoPrevAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickGoAdjacent(false);
			expect(component.store.dispatch).toHaveBeenCalledWith(new GoAdjacentOverlay({isNext: false}));
		});
		it('clickGoNext should dispatch action GoNextAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickGoAdjacent(true);
			expect(component.store.dispatch).toHaveBeenCalledWith(new GoAdjacentOverlay({isNext: true}));
		});
		it('clickExpand should dispatch action ExpandAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickExpand();
			expect(component.store.dispatch).toHaveBeenCalledWith(new ExpandAction());
		});
	});

	[{ k: 39, n: 'goNextActive', f: 'clickGoAdjacent' }, { k: 37, n: 'goPrevActive', f: 'clickGoAdjacent' }].forEach(key => {
		it(`onkeyup should call ${key.n} when keycode = "${key.k}"`, () => {
			spyOn(component, <'clickGoAdjacent'>key.f);
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


