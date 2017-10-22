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

describe('DeleteCaseComponent', () => {
	let component: DeleteCaseComponent;
	let fixture: ComponentFixture<DeleteCaseComponent>;

	const fake_iCasesState: ICasesState = {
		cases: [
			{ id: 'fake_id1', name: 'fake_name1' },
			{ id: 'fake_id2', name: 'fake_name2' }
		],
		modalCaseId: 'fake_id1',
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
			providers: [{ provide: casesConfig, useValue: { baseUrl: null } }]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => Observable.of(fake_iCasesState));

		fixture = TestBed.createComponent(DeleteCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('getActiveCaseName should return case_name by modalCaseId', () => {
		let clone_state = _.cloneDeep(fake_iCasesState);
		clone_state.modalCaseId = clone_state.cases[0].id;
		let result: string = component.getActiveCaseName(clone_state);
		expect(result).toEqual(clone_state.cases[0].name);
		clone_state.modalCaseId = clone_state.cases[1].id;
		result = component.getActiveCaseName(clone_state);
		expect(result).toEqual(clone_state.cases[1].name);
	});

	it('text on "p" tag should include case name', () => {
		let p_tag = fixture.nativeElement.querySelector('p');
		expect(p_tag.innerText).toEqual(`Are you sure you want to delete ${fake_iCasesState.cases[0].name}?`);
	});

	it('close should call store.dispatch with CloseModalAction', () => {
		component.close();
		expect(store.dispatch).toHaveBeenCalledWith(new CloseModalAction());
	});

	it('onSubmitRemove should call store.dispatch with CloseModalAction', () => {
		component.onSubmitRemove();
		expect(store.dispatch).toHaveBeenCalledWith(new DeleteCaseAction());
	});

});
