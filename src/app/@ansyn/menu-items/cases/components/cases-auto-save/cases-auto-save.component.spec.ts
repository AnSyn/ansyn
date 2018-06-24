import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesAutoSaveComponent } from './cases-auto-save.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';

describe('CasesAutoSaveComponent', () => {
	let component: CasesAutoSaveComponent;
	let fixture: ComponentFixture<CasesAutoSaveComponent>;
	let store: Store<any>;

	const fakeCase: Case = {
		id: '1',
		name: 'name',
		owner: 'owner',
		creationTime: new Date(),
		lastModified: new Date(),
		autoSave: true,
		state: {
			time: { type: '', from: new Date(), to: new Date() },
			region: {
				type: 'Polygon',
				coordinates: [
					[
						[-64.73, 32.31]
					]
				]
			},
			maps: {
				data: [
					{
						id: 'imagery1',
						data: {
							position: { zoom: 1, center: 2 },
							isAutoImageProcessingActive: true,
							overlay: 'overlay'
						}
					}
				],
				activeMapId: 'imagery1'
			},
			overlaysManualProcessArgs: {
				'overlay_123': { Contrast: 50, Brightness: 20 }
			}
		} as any
	};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer })
			],
			declarations: [CasesAutoSaveComponent]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(CasesAutoSaveComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	fit('click should dispatch UpdateCaseAction', () => {
		spyOn(store, 'dispatch');
		component.currentCase = fakeCase;
		component.onChange(true);
		fixture.detectChanges();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateCaseAction({ updatedCase: fakeCase, forceUpdate: true }));
	});
});
