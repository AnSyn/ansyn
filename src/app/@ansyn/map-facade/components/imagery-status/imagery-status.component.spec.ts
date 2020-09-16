import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { EntryComponentDirective } from '../../directives/entry-component.directive';
import { ENTRY_COMPONENTS_PROVIDER } from '../../models/entry-components-provider';
import { imageryStatusFeatureKey, ImageryStatusReducer } from '../../reducers/imagery-status.reducer';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { MockComponent } from '../../test/mock-component';
import { ImageryStatusComponent } from './imagery-status.component';
import { ClipboardModule, ClipboardService } from 'ngx-clipboard';
import { SetOverlaysFootprintActive } from '../../actions/map.actions';

const MAP: IMapSettings = {
	id: 'test',
	data: {
		position: {},
		overlay: {}
	},
	flags: {
		hideLayers: true
	},
	orientation: 'Imagery Perspective',
	worldView: {
		mapType: 'mapType',
		sourceType: 'sourceType'
	}
};
describe('ImageryStatusComponent', () => {
	let component: ImageryStatusComponent;
	let fixture: ComponentFixture<ImageryStatusComponent>;
	let communicatorService: ImageryCommunicatorService;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				ClipboardModule,
				HttpClientModule,
				FormsModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({
					[imageryStatusFeatureKey]: ImageryStatusReducer,
					[mapFeatureKey]: MapReducer
				}),
				TranslateModule.forRoot()
			],
			declarations: [
				ImageryStatusComponent,
				EntryComponentDirective,
				MockComponent({
					selector: 'ansyn-popover',
					inputs: ['text', 'icon', 'popDirection', 'showOverflow']
				})
			],
			providers: [
				ClipboardService,
				ImageryCommunicatorService,
				{ provide: ENTRY_COMPONENTS_PROVIDER, useValue: {status: [], container: [], floating_menu: []} }
			]
		}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService, Store], (_communicatorService, _store) => {
		communicatorService = _communicatorService;
		store = _store;
		fixture = TestBed.createComponent(ImageryStatusComponent);
		component = fixture.componentInstance;
		component._map = MAP;
		component.hideLayers = true;
		component.mapsAmount = 2;
		fixture.detectChanges();
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('check click on toggleMapSynchronization', () => {
		spyOnProperty(component, 'noGeoRegistration', 'get').and.returnValue(false);
		component.mapsAmount = 2;
		fixture.detectChanges();
		spyOn(component.toggleMapSynchronization, 'emit');
		fixture.nativeElement.querySelector('.link-maps').click();
		expect(component.toggleMapSynchronization.emit).toHaveBeenCalled();
	});


	it('should not show link when 1 map', () => {
		component.mapsAmount = 1;
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.link-maps')).toBeNull();
	});

	it('should return map extra description, if exists', () => {
		const myDescription = 'hehe';
		spyOn(communicatorService, 'provide').and.returnValue({
			ActiveMap: {
				getExtraData: () => ({
					description: myDescription
				})
			}
		});
		const result = component.overlayTimeDate;
		expect(result).toEqual(myDescription)
	});

	it('should fire SetOverlaysFootprintActive Action on click on overlays footprint', () => {
		spyOn(store, 'dispatch');
		component.toggleOverlaysFootprint();
		const newState = !component.overlaysFootprintActive;
		expect(store.dispatch).toHaveBeenCalledWith(new SetOverlaysFootprintActive({mapId: MAP.id, show: newState}))
	})
});
