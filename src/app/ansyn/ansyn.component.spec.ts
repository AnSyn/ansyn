import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnsynComponent } from './ansyn.component';
import { MockComponent } from '../packages/core/test/mock-component';
import { StatusBarReducer } from '../packages/status-bar/reducers/status-bar.reducer';
import { CasesReducer } from '../packages/menu-items/cases/reducers/cases.reducer';
import { StoreModule } from '@ngrx/store';

describe('AnsynComponent', () => {
	let component: AnsynComponent;
	let fixture: ComponentFixture<AnsynComponent>;
	let mock_menu = MockComponent({selector: 'ansyn-menu'});
	let mock_status = MockComponent({selector: 'ansyn-status-bar'});
	let mock_overlays_container = MockComponent({selector: 'overlays-container'});
	let mock_imagery_view = MockComponent({selector: 'ansyn-imageries-manager', inputs: ['selected_layout', 'maps']});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynComponent, mock_menu, mock_overlays_container, mock_status, mock_imagery_view],
			imports: [StoreModule.provideStore({status_bar: StatusBarReducer, cases: CasesReducer})]
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
