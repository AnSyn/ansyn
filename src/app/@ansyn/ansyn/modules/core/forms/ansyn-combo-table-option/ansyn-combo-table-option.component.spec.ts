import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AnsynComboTableComponent } from '../ansyn-combo-table/ansyn-combo-table.component';

import { AnsynComboTableOptionComponent } from './ansyn-combo-table-option.component';

describe('AnsynComboTableOptionComponent', () => {
	let component: AnsynComboTableOptionComponent;
	let fixture: ComponentFixture<AnsynComboTableOptionComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		imports: [TranslateModule.forRoot()],
		declarations: [ AnsynComboTableOptionComponent ],
		providers: [
			{
				provide: AnsynComboTableComponent,
				useValue: {
					selected: []
				}
			}
		]
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
