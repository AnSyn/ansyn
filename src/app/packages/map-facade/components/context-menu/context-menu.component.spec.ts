import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuComponent } from './context-menu.component';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { MapReducer } from '../../reducers/map.reducer';
import { MapEffects } from '../../effects/map.effects';

describe('ContextMenuComponent', () => {
	let component: ContextMenuComponent;
	let fixture: ComponentFixture<ContextMenuComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, StoreModule.provideStore({map: MapReducer})],
			declarations: [ ContextMenuComponent ],
			providers: [MapEffects]
		}).compileComponents();
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

	});


});
