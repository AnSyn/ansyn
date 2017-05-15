import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnsynComponent } from './ansyn.component';
import { MockComponent } from '../packages/core/test/mock-component';

describe('AnsynComponent', () => {
	let component: AnsynComponent;
	let fixture: ComponentFixture<AnsynComponent>;
	let mock_menu = MockComponent({selector: 'ansyn-menu'});
	let mock_overlays_container = MockComponent({selector: 'overlays-container'});
	let mock_imagery_view = MockComponent({selector: 'imagery-view', inputs: ['mapComponentSettings']});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynComponent, mock_menu, mock_overlays_container, mock_imagery_view ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
