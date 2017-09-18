import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CasesModalContainerComponent } from './cases-modal-container.component';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { DeleteCaseComponent } from '../delete-case/delete-case.component';
import { CasesModule } from '../../cases.module';
import { OpenModalAction } from '../../actions/cases.actions';
import { StoreModule } from '@ngrx/store';
import { CasesReducer } from '../../reducers/cases.reducer';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('ModalContainerComponent', () => {
	let component: CasesModalContainerComponent;
	let fixture: ComponentFixture<CasesModalContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				CasesModule,
				StoreModule.provideStore({ cases: CasesReducer }),
				RouterTestingModule
			],
			providers: [{ provide: casesConfig, useValue: { baseUrl: null } }]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesModalContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('buildTemplate should get OpenModalAction and create modal component ', () => {
		let action: OpenModalAction = new OpenModalAction({ component: EditCaseComponent });
		component.buildTemplate(action);
		expect(fixture.nativeElement.querySelector('ansyn-edit-case')).toBeDefined();
		expect(component.selected_component_ref.instance instanceof EditCaseComponent).toBeTruthy();

		action = new OpenModalAction({ component: DeleteCaseComponent });
		component.buildTemplate(action);
		expect(fixture.nativeElement.querySelector('ansyn-delete-case')).toBeDefined();
		expect(component.selected_component_ref.instance instanceof DeleteCaseComponent).toBeTruthy();
	});

	it('destroyTemplate should destory modal component', () => {
		component.selected_component_ref = { destroy: () => null };
		spyOn(component.selected_component_ref, 'destroy');
		component.destroyTemplate();
		expect(component.selected_component_ref.destroy).toHaveBeenCalled();
	});


});
