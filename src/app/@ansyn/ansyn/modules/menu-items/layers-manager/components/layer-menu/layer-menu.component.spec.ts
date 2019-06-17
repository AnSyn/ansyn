import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerMenuComponent } from './layer-menu.component';
import { TranslateModule } from '@ngx-translate/core';

describe('LayerMenuComponent', () => {
	let component: LayerMenuComponent;
	let fixture: ComponentFixture<LayerMenuComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LayerMenuComponent],
			imports: [TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LayerMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
