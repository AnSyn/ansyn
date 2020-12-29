import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynComboTableOptionComponent } from './ansyn-combo-table-option.component';

describe('AnsynComboTableOptionComponent', () => {
	let component: AnsynComboTableOptionComponent;
	let fixture: ComponentFixture<AnsynComboTableOptionComponent>;

  	beforeEach(async(() => {
	  	TestBed.configureTestingModule({
	 	declarations: [ AnsynComboTableOptionComponent ]
	  	})
	  	.compileComponents();
  }));

  	beforeEach(() => {
    	fixture = TestBed.createComponent(AnsynComboTableOptionComponent);
    	component = fixture.componentInstance;
    	fixture.detectChanges();
  });

  	it('should create', () => {
    	expect(component).toBeTruthy();
  	});
  });
