import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnsynRadioComponent } from './ansyn-radio.component';
import { FormsModule } from '@angular/forms';

describe('AnsynRadioComponent', () => {
	let component: AnsynRadioComponent;
	let fixture: ComponentFixture<AnsynRadioComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [AnsynRadioComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynRadioComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
