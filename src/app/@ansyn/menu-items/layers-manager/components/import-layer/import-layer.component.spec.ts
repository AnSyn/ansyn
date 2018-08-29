import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportLayerComponent } from './import-layer.component';
import { StoreModule } from '@ngrx/store';
import { DataLayersService } from '../../services/data-layers.service';

describe('ImportLayerComponent', () => {
	let component: ImportLayerComponent;
	let fixture: ComponentFixture<ImportLayerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImportLayerComponent],
			providers: [{ provide: DataLayersService, useValue: {} }],
			imports: [StoreModule.forRoot({})]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImportLayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
