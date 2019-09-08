import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComboBoxOptionComponent } from './combo-box-option.component';
import { ComboBoxComponent } from '../combo-box/combo-box.component';
import { EMPTY } from 'rxjs';

describe('ComboBoxOptionComponent', () => {
	let component: ComboBoxOptionComponent;
	let fixture: ComponentFixture<ComboBoxOptionComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ComboBoxOptionComponent],
			providers: [{
				provide: ComboBoxComponent,
				useValue: {
					injector: { get: () => ({ valueChanges: EMPTY }) }, selectOption: () => {
					}
				}
			}]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ComboBoxOptionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
