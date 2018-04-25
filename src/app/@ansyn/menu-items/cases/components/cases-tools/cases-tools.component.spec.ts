import { SaveCaseComponent } from '../save-case/save-case.component';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesToolsComponent } from './cases-tools.component';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { CasesModule } from '../../cases.module';
import { OpenModalAction } from '../../actions/cases.actions';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { CoreConfig } from '@ansyn/core/models/core.config';

describe('CasesToolsComponent', () => {
	let component: CasesToolsComponent;
	let fixture: ComponentFixture<CasesToolsComponent>;
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
				{ provide: casesConfig, useValue: {schema: null} },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(CasesToolsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesToolsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('add-case button should call showCaseModal()', () => {
		spyOn(component, 'showEditCaseModal');
		let button = fixture.nativeElement.querySelector('button.add-case');
		button.click();
		fixture.detectChanges();
		expect(component.showEditCaseModal).toHaveBeenCalled();
	});

	it('showEditCaseModal should call store.dispatch with OpenModalAction', () => {
		component.showEditCaseModal();
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({ component: EditCaseComponent }));
	});

	it('save-case button should call showCaseModal()', () => {
		spyOn(component, 'showSaveCaseModal');
		const button = fixture.nativeElement.querySelector('button.save-case');
		button.click();
		fixture.detectChanges();
		expect(component.showSaveCaseModal).toHaveBeenCalled();
	});

	it('showSaveCaseModal should call store.dispatch with showSaveCaseModal', () => {
		component.showSaveCaseModal();
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({ component: SaveCaseComponent }));
	});
});
