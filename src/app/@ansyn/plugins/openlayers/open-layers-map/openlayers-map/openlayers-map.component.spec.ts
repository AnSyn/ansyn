import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenlayersMapComponent } from './openlayers-map.component';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { OpenLayersProjectionService } from '../projection/open-layers-projection.service';
import { cold } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { PLUGINS_COLLECTIONS } from '@ansyn/imagery/model/plugins-collection';

describe('OpenlayersMapComponent', () => {
	let component: OpenlayersMapComponent;
	let fixture: ComponentFixture<OpenlayersMapComponent>;
	let map: OpenLayersMap;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OpenlayersMapComponent],
			providers: [
				{ provide: ProjectionService, useClass: OpenLayersProjectionService },
				{ provide: PLUGINS_COLLECTIONS, useValue: [] }
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OpenlayersMapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		map = (<any>component).map; // protected
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('createMap should raise map via success', () => {
		let success: boolean;

		beforeEach(() => {
			spyOn(map, 'initMap').and.callFake(() => Observable.of(success));
		});

		it('on success', () => {
			success = true;
			const expectedResult = cold('(b|)', { b: map });
			expect(component.createMap([])).toBeObservable(expectedResult);

		});

		it('on failed', () => {
			success = false;
			const expectedResult = cold('|');
			expect(component.createMap([])).toBeObservable(expectedResult);
		});

	});
});
