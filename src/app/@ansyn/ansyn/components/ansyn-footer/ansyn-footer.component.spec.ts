import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';

import { AnsynFooterComponent } from './ansyn-footer.component';
import { MockComponent } from '../../modules/core/test/mock-component';
import { StoreModule } from '@ngrx/store';
import { CoreConfig } from '../../modules/core/models/core.config';
import { TranslateModule } from '@ngx-translate/core';

describe('AnsynFooterComponent', () => {
	let component: AnsynFooterComponent;
	let fixture: ComponentFixture<AnsynFooterComponent>;

	const mockStatusBar = MockComponent({
		selector: 'ansyn-status-bar'
	});
	const mockOverlays = MockComponent({
		selector: 'ansyn-overlays-container'
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				AnsynFooterComponent,
				mockStatusBar,
				mockOverlays
			],
			imports: [
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer }),
				TranslateModule.forRoot()
			],
			providers: [
				{
					provide: CoreConfig,
					useValue: {}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynFooterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
