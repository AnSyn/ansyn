import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryTileProgressComponent } from './imagery-tile-progress.component';

describe('ImageryTileProgressComponent', () => {
	let component: ImageryTileProgressComponent;
	let fixture: ComponentFixture<ImageryTileProgressComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryTileProgressComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryTileProgressComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
