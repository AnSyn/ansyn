import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageriesManagerComponent } from './imageries-manager.component';
import { MockComponent } from '@ansyn/core/test';

describe('ImageriesManagerComponent', () => {
	let component: ImageriesManagerComponent;
	let fixture: ComponentFixture<ImageriesManagerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ ImageriesManagerComponent, MockComponent({selector: 'ansyn-imagery-container', inputs: ['mapComponentSettings', 'active', 'show-status']}) ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageriesManagerComponent);
		component = fixture.componentInstance;
		component.selected_layout = {id: '1', description:'', maps_count:1};
		component.maps = {active_map_id:'imagery1', data: [{id: 'imagery1'}]};
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
