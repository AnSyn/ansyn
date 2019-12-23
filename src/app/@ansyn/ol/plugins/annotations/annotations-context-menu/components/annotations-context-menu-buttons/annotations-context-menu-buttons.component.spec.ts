import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationsContextMenuButtonsComponent } from './annotations-context-menu-buttons.component';

describe('AnnotationsContextMenuButtonsComponent', () => {
	let component: AnnotationsContextMenuButtonsComponent;
	let fixture: ComponentFixture<AnnotationsContextMenuButtonsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationsContextMenuButtonsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationsContextMenuButtonsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
