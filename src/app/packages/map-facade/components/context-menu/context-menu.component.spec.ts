import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuComponent } from './context-menu.component';
import { FormsModule } from '@angular/forms';

describe('ContextMenuComponent', () => {
	let component: ContextMenuComponent;
	let fixture: ComponentFixture<ContextMenuComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [ ContextMenuComponent ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContextMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('get contextMenuStyle should return object with {top, left} from input', () => {
		component.top = 20;
		component.left = 10;

		expect(component.contextMenuStyle).toEqual( {
			top: '20px',
			left: '10px'
		});

	});


});
