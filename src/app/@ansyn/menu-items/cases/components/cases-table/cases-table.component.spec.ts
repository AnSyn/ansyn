import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesTableComponent } from './cases-table.component';
import { DeleteCaseComponent } from '../delete-case/delete-case.component';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { CasesModule } from '../../cases.module';
import { LoadCasesAction, OpenModalAction } from '../../actions/cases.actions';
import { casesConfig } from '@ansyn/menu-items/cases/services/cases.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { CoreConfig } from '@ansyn/core/models/core.config';

describe('CasesTableComponent', () => {
	let component: CasesTableComponent;
	let fixture: ComponentFixture<CasesTableComponent>;
	let store: Store<ICasesState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				CasesModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({[casesFeatureKey]: CasesReducer}),
				RouterTestingModule
			],
			providers: [
				{ provide: casesConfig, useValue: { schema: null } },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} }
			]
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

	it('onCasesAdded should change tbodyElement scrollTop to 0( only if tbodyElement is not undefined )', () => {
		component.tbodyElement = <any> {
			nativeElement: { scrollTop: 100 }
		};
		component.onCasesAdded();
		expect(component.tbodyElement.nativeElement.scrollTop).toEqual(0);
	});

	it('onMouseEnterCaseRow should calc the top of caseMenu and add "mouse-enter" class', () => {
		let caseMenu = <HTMLDivElement> { style: { top: '-1px' } };
		const caseRow = <HTMLDivElement> {
			offsetTop: 100, classList: jasmine.createSpyObj({
				add: () => null
			})
		};
		const tbodyElement = <HTMLDivElement> { scrollTop: 50 };
		component.onMouseEnterCaseRow(caseMenu, caseRow, tbodyElement);
		expect(caseMenu.style.top).toEqual('51px');
		expect(caseRow.classList.add).toHaveBeenCalledWith('mouse-enter');
	});

	it('onMouseLeaveCaseRow should remove "mouse-enter" class', () => {
		const caseRow = <HTMLDivElement> {
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.onMouseLeaveCaseRow(caseRow);
		expect(caseRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
	});

	it('caseMenuClick should call stopPropagation() and remove mouse-enter class from caseRow', () => {
		const $event = jasmine.createSpyObj({ stopPropagation: () => null });
		const caseRow = <HTMLDivElement> {
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.caseMenuClick($event, caseRow);
		expect($event.stopPropagation).toHaveBeenCalled();
		expect(caseRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
	});

	it('removeCase should open modal with DeleteCaseComponent', () => {
		let selectedCaseId = 'fakeSelectedCaseId';
		component.removeCase(selectedCaseId);
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({
			component: DeleteCaseComponent,
			caseId: selectedCaseId
		}));
	});

	it('editCase should open modal with EditCaseComponent', () => {
		let selectedCaseId = 'fakeSelectedCaseId';
		component.editCase(selectedCaseId);
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({
			component: EditCaseComponent,
			caseId: selectedCaseId
		}));
	});

});
