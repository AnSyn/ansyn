import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CasesTableComponent } from './cases-table.component';
import { DeleteCaseComponent } from "../delete-case/delete-case.component";
import { EditCaseComponent } from "../edit-case/edit-case.component";
import { CasesService } from '../../services/cases.service';
import { Store, StoreModule } from '@ngrx/store';
import { CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { CasesModule } from '../../cases.module';
import { LoadCasesAction, OpenModalAction, SelectCaseByIdAction } from '../../actions/cases.actions';
import { HttpModule } from '@angular/http';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';

describe('CasesTableComponent', () => {
	let component: CasesTableComponent;
	let fixture: ComponentFixture<CasesTableComponent>;
	let casesService: CasesService;
	let store: Store<ICasesState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule, CasesModule, StoreModule.provideStore({ cases: CasesReducer }), RouterTestingModule],
			providers: [{ provide: casesConfig, useValue: { casesBaseUrl: null } }]
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
		component.selectCase("id");
		expect(store.dispatch).toHaveBeenCalledWith(new SelectCaseByIdAction("id"));
	});

	it('onCasesAdded should change tbody_element scrollTop to 0( only if tbody_element is not undefined )', () => {
		component.tbody_element = <any> {
			nativeElement: {scrollTop: 100}
		};
		component.onCasesAdded();
		expect(component.tbody_element.nativeElement.scrollTop).toEqual(0);
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
		let selected_case_id: string = 'fake_selected_case_id';
		component.removeCase($event, selected_case_id);
		expect($event.stopPropagation).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({ component: DeleteCaseComponent, case_id: selected_case_id }));
	});

	it('editCase should call stopPropagation() and open modal with EditCaseComponent', () => {
		let $event = <any>{ stopPropagation: () => null };
		spyOn($event, 'stopPropagation');
		let selected_case_id: string = 'fake_selected_case_id';
		component.editCase($event, selected_case_id);
		expect($event.stopPropagation).toHaveBeenCalled();
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({ component: EditCaseComponent, case_id: selected_case_id }));
	});

});
