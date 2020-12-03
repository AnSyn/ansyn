import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynModalComponent } from './ansyn-modal.component';
import { MockPipe } from '../../test/mock-pipe';

describe('AnsynModalComponent', () => {
	let component: AnsynModalComponent;
	let fixture: ComponentFixture<AnsynModalComponent>;
	const mockTranslatePipe = MockPipe('translate');

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				AnsynModalComponent,
				mockTranslatePipe
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('close() should call showChange.emit with "false"', () => {
		spyOn(component.showChange, 'emit');
		component.close();
		expect(component.showChange.emit).toHaveBeenCalledWith(false);
	});
});
