import { SaveCaseAsAction } from '../../actions/cases.actions';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { SaveCaseComponent } from './save-case.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CasesModule } from '../../cases.module';
import { Store, StoreModule } from '@ngrx/store';
import { casesConfig } from '@ansyn/menu-items/cases';
import { Observable } from 'rxjs/Observable';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';

describe('SaveCaseComponent', () => {
	let component: SaveCaseComponent;
	let fixture: ComponentFixture<SaveCaseComponent>;
	let store: Store<ICasesState>;

	let fakeICasesState: ICasesState = {
		cases: [
			{ id: 'fakeId1', name: 'fakeName1', state: { selectedContextId: null } },
			{ id: 'fakeId2', name: 'fakeName2', state: { selectedContextId: null } }
		],
		modalCaseId: 'fakeId1',
		modal: true,
		contexts: [],
		contextsLoaded: true,
		selectedCase: { id: 'fakeId1', name: 'fakeName1', state: { selectedContextId: null } },
		defaultCase: { id: 'fakeId3', name: 'fakeName3', state: { selectedContextId: null } }
	} as any;

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
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => Observable.of(fakeICasesState));

		fixture = TestBed.createComponent(SaveCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('onSubmitCase should call dispatch with SaveCaseAsAction and call close()', () => {
		spyOn(component, 'close');
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new SaveCaseAsAction(component.caseModel));
		expect(component.close).toHaveBeenCalled();
	});
});
