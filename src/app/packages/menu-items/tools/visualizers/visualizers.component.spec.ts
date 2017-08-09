import { async, ComponentFixture, TestBed, inject  } from '@angular/core/testing';
import { ShowOverlaysFootprintAction, StartMouseShadow, StopMouseShadow } from '../actions/tools.actions';
import { Store,StoreModule } from '@ngrx/store';
import { VisualizersComponent } from './visualizers.component';
import { ToolsReducer } from '../reducers/tools.reducer';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { CasesReducer, ICasesState } from '../../cases/reducers/cases.reducer';
import { FormsModule } from '@angular/forms';
import { AddCaseSuccessAction, SelectCaseByIdAction } from '../../cases/actions/cases.actions';
import { Observable } from 'rxjs/Observable';

describe('VisualizersComponent', () => {
	let component: VisualizersComponent;
	let fixture: ComponentFixture <VisualizersComponent> ;
	let store: Store <any> ;
	let icase_state: ICasesState;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, StoreModule.provideStore({ tools: ToolsReducer}), StoreModule.provideStore({ cases: CasesReducer})],
			declarations: [VisualizersComponent]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store <any>)=> {
		store = _store;
		spyOn(store,'dispatch');

		icase_state = {
			selected_case: {
				id: 'case1',
				state: {
					maps: {
						active_map_id: '5555',
						data:[
							{
								id: '5555',
								data: {}
							},
							{
								id: '4444',
								data: {}
							}
						]
					}
				}
			}
		} as any;

		const fakeStore = {cases: icase_state, tools: {}};

		spyOn(store, 'select').and.callFake(type => {
			return Observable.of(fakeStore[type]);
		});

		store.dispatch(new AddCaseSuccessAction(icase_state.selected_case));
		store.dispatch(new SelectCaseByIdAction(icase_state.selected_case.id));
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VisualizersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check that ShowOverlaysFootprintAction is dispatched when visualizerType change',() =>{
		component.visualizerType = 'Hitmap';
		expect(store.dispatch).toHaveBeenCalledWith(new ShowOverlaysFootprintAction('Hitmap'));
	});
});
