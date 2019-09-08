import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingMenuComponent } from './floating-menu.component';
import { ENTRY_COMPONENTS_PROVIDER } from '../../models/entry-components-provider';
import { EntryComponentDirective } from '../../directives/entry-component.directive';
import { MockComponent } from '../../test/mock-component';

describe('FloatingMenuComponent', () => {
	let component: FloatingMenuComponent;
	let fixture: ComponentFixture<FloatingMenuComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				FloatingMenuComponent,
				EntryComponentDirective,
				MockComponent({
					selector: 'ansyn-imagery-rotation',
					inputs: ['mapState']
				})
			],
			providers: [
				{ provide: ENTRY_COMPONENTS_PROVIDER, useValue: [] },
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FloatingMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
