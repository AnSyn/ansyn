import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { CasesTableComponent } from './cases-table.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { CasesType } from '../../models/cases-config';
import { TranslateModule } from '@ngx-translate/core';
import { LoadCaseAction } from '../../actions/cases.actions';

describe('CasesTableComponent', () => {
	let component: CasesTableComponent;
	let fixture: ComponentFixture<CasesTableComponent>;
	let store: Store<ICasesState>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [CasesTableComponent],
			imports: [
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer }),
				TranslateModule.forRoot()
			],
			providers: []
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(CasesTableComponent);
		component = fixture.componentInstance;
		component.cases = {
			type: CasesType.MyCases,
			entities: {},
			ids: []
		};
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('onCasesAdded should change tbodyElement scrollTop to 0( only if tbodyElement is not undefined )', () => {
		component.tbodyElement = <any>{
			nativeElement: { scrollTop: 100 }
		};
		component.onCasesAdded();
		expect(component.tbodyElement.nativeElement.scrollTop).toEqual(0);
	});

	it('onMouseEnterCaseRow should calc the top of caseMenu and add "mouse-enter" class', () => {
		const caseRow = <HTMLDivElement>{
			offsetTop: 100, classList: jasmine.createSpyObj({
				add: () => null
			})
		};
		component.onMouseEnterCaseRow(caseRow, 'id');
		expect(caseRow.classList.add).toHaveBeenCalledWith('mouse-enter');
	});

	it('onMouseLeaveCaseRow should remove "mouse-enter" class', () => {
		const caseRow = <HTMLDivElement>{
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.onMouseLeaveCaseRow(caseRow);
		expect(caseRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
	});

	it('caseMenuClick should call stopPropagation() and remove mouse-enter class from caseRow', () => {
		const $event = jasmine.createSpyObj({ stopPropagation: () => null });
		const caseRow = <HTMLDivElement>{
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.caseMenuClick($event, caseRow);
		expect($event.stopPropagation).toHaveBeenCalled();
		expect(caseRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
	});

	it('selectCase should dispatch LoadCaseAction', () => {
		component.selectCase('case-id');
		expect(store.dispatch).toHaveBeenCalledWith(new LoadCaseAction('case-id'));
	})

});
