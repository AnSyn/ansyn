import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { EntitiesTableComponent } from './entities-table.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../../menu-items/cases/reducers/cases.reducer';
import { CasesType } from '../../../menu-items/cases/models/cases-config';
import { TranslateModule } from '@ngx-translate/core';
import { LoadCaseAction } from '../../../menu-items/cases/actions/cases.actions';

describe('CasesTableComponent', () => {
	let component: EntitiesTableComponent<any>;
	let fixture: ComponentFixture<EntitiesTableComponent<any>>;
	let store: Store<ICasesState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EntitiesTableComponent],
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
		fixture = TestBed.createComponent(EntitiesTableComponent);
		component = fixture.componentInstance;
		component.entities = {
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
		component.onEntityAdded();
		expect(component.tbodyElement.nativeElement.scrollTop).toEqual(0);
	});

	it('onMouseEnterCaseRow should calc the top of caseMenu and add "mouse-enter" class', () => {
		const caseRow = <HTMLDivElement>{
			offsetTop: 100, classList: jasmine.createSpyObj({
				add: () => null
			})
		};
		component.onMouseEnterRow(caseRow, 'id');
		expect(caseRow.classList.add).toHaveBeenCalledWith('mouse-enter');
	});

	it('onMouseLeaveCaseRow should remove "mouse-enter" class', () => {
		const caseRow = <HTMLDivElement>{
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.onMouseLeaveRow(caseRow);
		expect(caseRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
	});

	it('caseMenuClick should call stopPropagation() and remove mouse-enter class from caseRow', () => {
		const $event = jasmine.createSpyObj({ stopPropagation: () => null });
		const caseRow = <HTMLDivElement>{
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.menuClick($event, caseRow);
		expect($event.stopPropagation).toHaveBeenCalled();
		expect(caseRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
	});

});
