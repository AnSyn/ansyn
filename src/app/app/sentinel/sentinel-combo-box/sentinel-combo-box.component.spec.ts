import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SentinelComboBoxComponent } from './sentinel-combo-box.component';

describe('SentinelComboBoxComponent', () => {
	let component: SentinelComboBoxComponent;
	let fixture: ComponentFixture<SentinelComboBoxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SentinelComboBoxComponent],
			imports: [FormsModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SentinelComboBoxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
