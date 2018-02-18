import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { DeleteCaseComponent } from './delete-case.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { CasesModule } from '../../cases.module';
import { CloseModalAction, DeleteCaseAction } from '../../actions/cases.actions';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';

describe('DeleteCaseComponent', () => {
	let component: DeleteCaseComponent;
	let fixture: ComponentFixture<DeleteCaseComponent>;

	const fakeICasesState: ICasesState = {
		cases: [
			{ id: 'fakeId1', name: 'fakeName1' },
			{ id: 'fakeId2', name: 'fakeName2' }
		],
		modalCaseId: 'fakeId1',
		selectedCaseId: null,
		modal: true
	} as any;

	let store: Store<ICasesState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				CasesModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer }),
				RouterTestingModule
			],
			providers: [{ provide: casesConfig, useValue: { baseUrl: null } },  { provide: LoggerConfig, useValue: {} }]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => Observable.of(fakeICasesState));

		fixture = TestBed.createComponent(DeleteCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('getActiveCaseName should return caseName by modalCaseId', () => {
		let cloneState = _.cloneDeep(fakeICasesState);
		cloneState.modalCaseId = cloneState.cases[0].id;
		let result: string = component.getActiveCaseName(cloneState);
		expect(result).toEqual(cloneState.cases[0].name);
		cloneState.modalCaseId = cloneState.cases[1].id;
		result = component.getActiveCaseName(cloneState);
		expect(result).toEqual(cloneState.cases[1].name);
	});

	it('text on "p" tag should include case name', () => {
		let pTag = fixture.nativeElement.querySelector('p');
		expect(pTag.innerText).toEqual(`Are you sure you want to delete ${fakeICasesState.cases[0].name}?`);
	});

	it('close should call store$$.dispatch with CloseModalAction', () => {
		component.close();
		expect(store.dispatch).toHaveBeenCalledWith(new CloseModalAction());
	});

	it('onSubmitRemove should call store$$.dispatch with CloseModalAction', () => {
		component.onSubmitRemove();
		expect(store.dispatch).toHaveBeenCalledWith(new DeleteCaseAction());
	});

});
