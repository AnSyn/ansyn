import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnsynComboTableComponent } from './ansyn-combo-table.component';

describe('AnsynComboTableComponent', () => {
	let component: AnsynComboTableComponent;
	let fixture: ComponentFixture<AnsynComboTableComponent>;

	beforeEach(waitForAsync(() => {
	TestBed.configureTestingModule({
		declarations: [ AnsynComboTableComponent ]
	})
	.compileComponents();
	}));

	beforeEach(() => {
	fixture = TestBed.createComponent(AnsynComboTableComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
	});

	it('should create', () => {
	expect(component).toBeTruthy();
	});
	});
