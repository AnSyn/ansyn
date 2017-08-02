import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtmComponent } from './utm.component';
import { FormsModule } from '@angular/forms';

describe('UtmComponent', () => {
	let component: UtmComponent;
	let fixture: ComponentFixture<UtmComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ UtmComponent ],
			imports: [FormsModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UtmComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
