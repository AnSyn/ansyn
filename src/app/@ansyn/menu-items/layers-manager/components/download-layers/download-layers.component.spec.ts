import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadLayersComponent } from './download-layers.component';

describe('DownloadLayersComponent', () => {
	let component: DownloadLayersComponent;
	let fixture: ComponentFixture<DownloadLayersComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DownloadLayersComponent]
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
