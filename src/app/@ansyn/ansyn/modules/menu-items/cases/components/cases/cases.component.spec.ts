import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CasesComponent } from './cases.component';
import { CasesService } from '../../services/cases.service';
import { MockComponent } from '../../../../core/test/mock-component';
import { mapFacadeConfig, MapFacadeModule } from '@ansyn/map-facade';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';


let a = MockComponent({ selector: 'ansyn-cases-tools' });
let b = MockComponent({ selector: 'ansyn-cases-table' });
let c = MockComponent({ selector: 'ansyn-cases-modal-container' });


describe('CasesComponent', () => {
	let component: CasesComponent;
	let fixture: ComponentFixture<CasesComponent>;
	let casesService: CasesService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CasesComponent, a, b, c],
			imports: [StoreModule.forRoot({}),
				MapFacadeModule,
				EffectsModule.forRoot([]),],
			providers: [{ provide: mapFacadeConfig, useValue: {} }]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});


});
