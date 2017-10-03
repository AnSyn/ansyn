import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesTableComponent } from './cases-table.component';
import { DeleteCaseComponent } from '../delete-case/delete-case.component';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { Store, StoreModule } from '@ngrx/store';
import { CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { CasesModule } from '../../cases.module';
import { LoadCasesAction, OpenModalAction, SelectCaseByIdAction } from '../../actions/cases.actions';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('CasesTableComponent', () => {
	let component: CasesTableComponent;
	let fixture: ComponentFixture<CasesTableComponent>;
	let store: Store<ICasesState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				CasesModule,
				StoreModule.provideStore({ cases: CasesReducer }),
				RouterTestingModule
			],
			providers: [{ provide: casesConfig, useValue: { baseUrl: null } }]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(CasesTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('loadCases should call casesService.loadCases()', () => {
		component.loadCases();
		expect(store.dispatch).toHaveBeenCalledWith(new LoadCasesAction());
	});

	it('selectCase should call casesService.selectCase', () => {
		component.selectCase('id');
		expect(store.dispatch).toHaveBeenCalledWith(new SelectCaseByIdAction('id'));
	});

	it('onCasesAdded should change tbodyElement scrollTop to 0( only if tbody_element is not undefined )', () => {
		component.tbodyElement = <any> {
			nativeElement: { scrollTop: 100 }
		};
		component.onCasesAdded();
		expect(component.tbodyElement.nativeElement.scrollTop).toEqual(0);
	});

	it('calcTopCaseMenu should get MouseEvent calc the top and put on case_menu.style', () => {
		let case_menu = <any>{ style: { top: '-1px' } };
		let $event = <any>{ target: { offsetTop: 100, parentElement: { scrollTop: 50 } } };
		component.calcTopCaseMenu($event, case_menu);
		expect(case_menu.style.top).toEqual('50px');
	});

	it('removeCase should call stopPropagation() and open modal with DeleteCaseComponent', () => {
		let $event = <any>{ stopPropagation: () => null };
		spyOn($event, 'stopPropagation');
		let selectedCaseId = 'fakeSelectedCaseId';
		component.removeCase($event, selectedCaseId);
		expect($event.stopPropagation).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({
			component: DeleteCaseComponent,
			caseId: selectedCaseId
		}));
	});

	it('editCase should call stopPropagation() and open modal with EditCaseComponent', () => {
		let $event = <any>{ stopPropagation: () => null };
		spyOn($event, 'stopPropagation');
		let selectedCaseId = 'fakeSelectedCaseId';
		component.editCase($event, selectedCaseId);
		expect($event.stopPropagation).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({
			component: EditCaseComponent,
			caseId: selectedCaseId
		}));
	});

});
