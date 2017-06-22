import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { Store, StoreModule } from '@ngrx/store';
import { IStatusBarState, statusBarFlagsItems, StatusBarReducer } from '../reducers/status-bar.reducer';
import { StatusBarModule } from '../status-bar.module';
import { ChangeLayoutAction, UpdateStatusFlagsAction } from '../actions/status-bar.actions';

describe('StatusBarComponent', () => {
	let component: StatusBarComponent;
	let fixture: ComponentFixture<StatusBarComponent>;
	let store: Store<IStatusBarState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StatusBarModule, StoreModule.provideStore({status_bar: StatusBarReducer})],
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


	it('eye indicator should be active',() => {
		let result = fixture.nativeElement.querySelector('.status-bar-eye-icon').classList.contains('active');
		expect(result).toBe(true);
		component.flags.set(statusBarFlagsItems.pinPointIndicator,false);
		fixture.detectChanges();
		result = fixture.nativeElement.querySelector('.status-bar-eye-icon').classList.contains('active');
		expect(result).toBe(false);
	})

	it("check click on pinPoint flags",() => {
		spyOn(store,'dispatch');
		fixture.nativeElement.querySelector('.status-bar-edit-icon img').click();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction ({ key : statusBarFlagsItems.pinPointSearch}));

		fixture.nativeElement.querySelector('.status-bar-eye-icon img').click();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateStatusFlagsAction ({ key : statusBarFlagsItems.pinPointIndicator}));
	})

});
