import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryTileProgressComponent } from './imagery-tile-progress.component';
import { StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';

describe('ImageryTileProgressComponent', () => {
	let component: ImageryTileProgressComponent;
	let fixture: ComponentFixture<ImageryTileProgressComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [mapFeatureKey]: MapReducer })],
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
