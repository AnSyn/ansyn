import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadLayersComponent } from './download-layers.component';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';

describe('DownloadLayersComponent', () => {
	let component: DownloadLayersComponent;
	let fixture: ComponentFixture<DownloadLayersComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DownloadLayersComponent],
			imports: [StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DownloadLayersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
