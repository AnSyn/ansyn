import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryTileProgressComponent } from './imagery-tile-progress.component';
import { StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('ImageryTileProgressComponent', () => {
	let component: ImageryTileProgressComponent;
	let fixture: ComponentFixture<ImageryTileProgressComponent>;
	let mapLoader: DebugElement;

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
		mapLoader = fixture.debugElement.query(By.css('.map-loader'));
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('progress percent should effect loader width', () => {
		component.progress = 70;
		fixture.detectChanges();
		expect(mapLoader.styles.width).toEqual('70%');
	});

	it('progress percent on 100 should hide the loader', () => {
		component.progress = 100;
		fixture.detectChanges();
		expect(mapLoader.properties.hidden).toBeTruthy();
	});


});
