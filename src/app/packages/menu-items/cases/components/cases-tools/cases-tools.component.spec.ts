import { CoreModule } from '@ansyn/core';
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CasesToolsComponent } from './cases-tools.component';
import { CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { CasesModule } from '../../cases.module';
import { HttpModule } from '@angular/http';
import { OpenModalAction } from '../../actions/cases.actions';
import { EditCaseComponent } from '../edit-case/edit-case.component';

describe('CasesToolsComponent', () => {
	let component: CasesToolsComponent;
	let fixture: ComponentFixture<CasesToolsComponent>;
	let store: Store<ICasesState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports:[HttpModule, CasesModule, StoreModule.provideStore({cases: CasesReducer}), CoreModule.forRoot(null)],
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(CasesToolsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesToolsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('add-case button should call showCaseModal()', () => {
		spyOn(component, 'showCaseModal');
		let button = fixture.nativeElement.querySelector("button.add-case");
		button.click();
		fixture.detectChanges();
		expect(component.showCaseModal).toHaveBeenCalled();
	});

	it('showCaseModal should call store.dispatch with OpenModalAction', () => {
	  component.showCaseModal();
	  expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({component: EditCaseComponent}));
	});

});
