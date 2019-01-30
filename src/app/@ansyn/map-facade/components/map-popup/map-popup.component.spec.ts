import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { of } from 'rxjs'

import { MapPopupComponent } from './map-popup.component';
import { PopupService } from '../../services/popup.service';

describe('MapPopupComponent', () => {
	let component: MapPopupComponent;
	let fixture: ComponentFixture<MapPopupComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({})],
			declarations: [MapPopupComponent],
			providers: [
				{
					provide: PopupService,
					useValue: {
						getInfo: (a) => of('{}')
					}
				},
				{
					provide: ImageryCommunicatorService,
					useValue: {
						provide: () => ({
							activeMap: () => {}
						})
					}


				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(MapPopupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should be defined', () => {
		expect(component).toBeDefined();
	})
});
