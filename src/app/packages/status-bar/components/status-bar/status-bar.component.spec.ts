import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { Store, StoreModule } from '@ngrx/store';
import { IStatusBarState, statusBarFlagsItems, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { StatusBarModule } from '../../status-bar.module';
import {
	BackToWorldViewAction,
	ChangeLayoutAction,
	ExpandAction,
	FavoriteAction,
	GoNextAction,
	GoPrevAction,
	UpdateStatusFlagsAction
} from '../../actions/status-bar.actions';

describe('StatusBarComponent', () => {
	let component: StatusBarComponent;
	let fixture: ComponentFixture<StatusBarComponent>;
	let store: Store<IStatusBarState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StatusBarModule, StoreModule.provideStore({ status_bar: StatusBarReducer })],
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

	it('layoutSelectChange call store.dispatch with ChangeLayoutAction', () => {
		spyOn(store, 'dispatch');
		component.layoutSelectChange(5);
		expect(store.dispatch).toHaveBeenCalledWith(new ChangeLayoutAction(5));
	});


	it('eye indicator should be active', () => {
		let result = fixture.nativeElement.querySelector('.status-bar-eye-icon').classList.contains('active');
		expect(result).toBe(true);
		component.flags.set(statusBarFlagsItems.pinPointIndicator, false);
		fixture.detectChanges();
		result = fixture.nativeElement.querySelector('.status-bar-eye-icon').classList.contains('active');
		expect(result).toBe(false);
	});

	it('check click on pinPoint flags', () => {
		spyOn(store, 'dispatch');
		fixture.nativeElement.querySelector('.status-bar-edit-icon img').click();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch }));

		fixture.nativeElement.querySelector('.status-bar-eye-icon img').click();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointIndicator }));
	});
	describe('clicks', () => {
		it('clickBackToWorldView should dispatch action BackToWorldView', () => {
			spyOn(component.store, 'dispatch');
			component.clickBackToWorldView();
			expect(component.store.dispatch).toHaveBeenCalledWith(new BackToWorldViewAction());
		});
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

		it('clickFavorite should dispatch action FavoriteAction', () => {
			spyOn(component.store, 'dispatch');
			component.clickFavorite();
			expect(component.store.dispatch).toHaveBeenCalledWith(new FavoriteAction());
		});
	});
	it('onkeyup should call goNext when keycode = "39" and clickGoPrev when keycode = "37", and remove "active" class from next,prev buttons', () => {
		spyOn(component.goPrev.nativeElement.classList, 'remove');
		spyOn(component.goNext.nativeElement.classList, 'remove');

		spyOn(component, 'clickGoPrev');
		spyOn(component, 'clickGoNext');
		const $event = {
			code: 'ArrowRight',
			currentTarget: { document: { activeElement: {} } }
		};
		component.onkeyup(<any>$event);
		expect(component.goNext.nativeElement.classList.remove).toHaveBeenCalledWith('active');
		expect(component.clickGoNext).toHaveBeenCalled();
		$event.code = 'ArrowLeft';
		component.onkeyup(<any>$event);
		expect(component.goPrev.nativeElement.classList.remove).toHaveBeenCalledWith('active');
		expect(component.clickGoPrev).toHaveBeenCalled();
	});

	it('onkeydown should add "active" class to goNext or goPrev according to keyCode', () => {
		spyOn(component.goPrev.nativeElement.classList, 'add');
		spyOn(component.goNext.nativeElement.classList, 'add');
		const $event = {
			code: 'ArrowRight',
			currentTarget: { document: { activeElement: {} } }
		};
		component.onkeydown(<any>$event);
		expect(component.goNext.nativeElement.classList.add).toHaveBeenCalledWith('active');
		$event.code = 'ArrowLeft';
		component.onkeydown(<any>$event);
		expect(component.goPrev.nativeElement.classList.add).toHaveBeenCalledWith('active');
	});

	it('check isFavoriteOverlayDisplayed changes', () => {
		component.isFavoriteOverlayDisplayed = true;
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.favorite-icon').classList.contains('active')).toBeTruthy();
		component.isFavoriteOverlayDisplayed = false;
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.favorite-icon').classList.contains('active')).toBeFalsy();
	});
});
