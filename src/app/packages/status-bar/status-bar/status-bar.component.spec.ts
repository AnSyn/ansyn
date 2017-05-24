import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { Store, StoreModule } from '@ngrx/store';
import { IStatusBarState, StatusBarReducer } from '../reducers/status-bar.reducer';
import { StatusBarModule } from '../status-bar.module';
import { ChangeLayoutAction } from '../actions/status-bar.actions';

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

});
