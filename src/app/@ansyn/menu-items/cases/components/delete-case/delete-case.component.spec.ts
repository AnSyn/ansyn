import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { DeleteCaseComponent } from './delete-case.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { CasesModule } from '../../cases.module';
import { CloseModalAction, DeleteCaseAction } from '../../actions/cases.actions';
import { Observable, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { CoreConfig, LoggerConfig } from '@ansyn/core';
import { casesConfig, CasesService } from '../../services/cases.service';
import { DataLayersService, layersConfig } from '../../../layers-manager/services/data-layers.service';

describe('DeleteCaseComponent', () => {
	let component: DeleteCaseComponent;
	let fixture: ComponentFixture<DeleteCaseComponent>;
	let casesService: CasesService;

	const fakeICasesState: ICasesState = {
		entities: {
			'fakeId1': { id: 'fakeId1', name: 'fakeName1' },
			'fakeId2': { id: 'fakeId2', name: 'fakeName2' }
		},
		ids: ['fakeId1', 'fakeId2'],
		modalCaseId: 'fakeId1',
		modal: {
			id: 'fakeId1',
			show: true
		}
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
			providers: [
				DataLayersService,
				{ provide: casesConfig, useValue: { schema: null } },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: layersConfig, useValue: {} }
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store, CasesService], (_store: Store<ICasesState>, _casesService: CasesService) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => of(fakeICasesState));

		fixture = TestBed.createComponent(DeleteCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
		casesService = _casesService;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('text on "p" tag should include case name', () => {
		let pTag = fixture.nativeElement.querySelector('p');
		expect(pTag.innerText).toEqual(`Are you sure you want to delete ${fakeICasesState.entities['fakeId1'].name}?`);
	});

	it('close should call store.dispatch with CloseModalAction', () => {
		component.close();
		expect(store.dispatch).toHaveBeenCalledWith(new CloseModalAction());
	});

	it('onSubmitRemove should call store.dispatch with CloseModalAction', () => {
		spyOn(casesService, 'removeCase').and.returnValue(of(component.activeCase));
		spyOn(component, 'close');
		component.onSubmitRemove();
		expect(store.dispatch).toHaveBeenCalledWith(new DeleteCaseAction(component.activeCase.id));
		expect(component.close).toHaveBeenCalled();

	});

});
