import { ComponentFixture, fakeAsync, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { DeleteCaseComponent } from './delete-case.component';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { AddCasesAction, CloseModalAction, DeleteCaseAction, OpenModalAction } from '../../actions/cases.actions';
import { of } from 'rxjs';
import { CasesService } from '../../services/cases.service';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule } from '@ngrx/store';
import { CasesType } from '../../models/cases-config';

const mockCases = [
		{ id: 'fakeId1', name: 'fakeName1' },
		{ id: 'fakeId2', name: 'fakeName2' }
	];

const mockModal = {
	show: true,
	id: 'fakeId1',
	type: 'delete'
};

describe('DeleteCaseComponent', () => {
	let component: DeleteCaseComponent;
	let fixture: ComponentFixture<DeleteCaseComponent>;
	let store: Store<ICasesState>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				BrowserAnimationsModule,
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer }),
				TranslateModule.forRoot()
			],
			providers: [
				{
					provide: CasesService,
					useValue: {
						removeCase: () => of({})
					}
				}
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store, CasesService], (_store: Store<ICasesState>, _casesService: CasesService) => {
		fixture = TestBed.createComponent(DeleteCaseComponent);
		component = fixture.componentInstance;
		store = _store;
		store.dispatch(new AddCasesAction({ cases: <any>mockCases }));
		store.dispatch(new OpenModalAction(<any>{ caseId: 'fakeId1' }));
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('text on "div.text" tag should include case name', fakeAsync(() => {
		let textElement = fixture.nativeElement.querySelector('div.text');
		expect(textElement.innerText.includes(mockCases[0].name)).toBeTruthy();
	}));

	it('close should call store.dispatch with CloseModalAction', () => {
		spyOn(store, 'dispatch');
		component.close();
		expect(store.dispatch).toHaveBeenCalledWith(new CloseModalAction());
	});

	it('onSubmitRemove should call store.dispatch with CloseModalAction', () => {
		spyOn(store, 'dispatch');
		spyOn(component, 'close');
		component.onSubmitRemove();
		expect(store.dispatch).toHaveBeenCalledWith(new DeleteCaseAction({
			id: component.activeCase.id,
			name: component.activeCase.name,
			type: CasesType.MyCases
		}));
		expect(component.close).toHaveBeenCalled();

	});

});
