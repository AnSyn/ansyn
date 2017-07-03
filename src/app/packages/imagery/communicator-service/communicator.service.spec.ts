/**
 * Created by AsafMas on 08/05/2017.
 */

import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryCommunicatorService } from './communicator.service';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';
import { EventEmitter } from '@angular/core';
import { MapPosition } from '../model/map-position';

describe('CommunicatorEntity', () => {
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({declarations: [], providers: [ ImageryCommunicatorService]}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should create "imageryCommunicatorService" service', () => {
		expect(imageryCommunicatorService).toBeTruthy();
	});

	it('createCommunicator should raise instanceCreated event', () => {

		const componentManager: ImageryComponentManager = <any>{
			Id: "1",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};
		spyOn(imageryCommunicatorService.instanceCreated, 'emit');
		imageryCommunicatorService.createCommunicator(componentManager);
		expect(imageryCommunicatorService.instanceCreated.emit).toHaveBeenCalledWith({
				communicatorsIds: ["1"],
				currentCommunicatorId: "1"
			}
		);
	});

	it('provide Communicator should return expected communicator', () => {

		const componentManager1: ImageryComponentManager = <any>{
			Id: "1",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		const componentManager2: ImageryComponentManager = <any>{
			Id: "2",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		expect((<any>(imageryCommunicatorService.provide(componentManager2.Id)))._manager).toEqual(componentManager2);
		expect((<any>(imageryCommunicatorService.provide(componentManager1.Id)))._manager).toEqual(componentManager1);
		expect(imageryCommunicatorService.provide("3")).toEqual(null);
	});

	it('communicators should return object containing the communicators', () => {

		const componentManager1: ImageryComponentManager = <any>{
			Id: "1",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		const componentManager2: ImageryComponentManager = <any>{
			Id: "2",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		const communicatorsObject = imageryCommunicatorService.communicators;
		expect((<any>(communicatorsObject[componentManager1.Id]))._manager).toEqual(componentManager1);
	});

	it('communicatorsAsArray should return array of communicators', () => {

		const componentManager1: ImageryComponentManager = <any>{
			Id: "1",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		const componentManager2: ImageryComponentManager = <any>{
			Id: "2",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		const communicatorsArray = imageryCommunicatorService.communicatorsAsArray();
		expect(communicatorsArray.length).toEqual(2);
	});

	it('replaceCommunicatorId should replace the communicator Id', () => {

		const componentManager1: ImageryComponentManager = <any>{
			Id: "1",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		const componentManager2: ImageryComponentManager = <any>{
			Id: "2",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		imageryCommunicatorService.replaceCommunicatorId(componentManager2.Id, "3");

		expect(imageryCommunicatorService.provide("2")).toEqual(null);
		expect((<any>(imageryCommunicatorService.provide("3")))._manager).toEqual(componentManager2);
	});

	it('remove should remove the communicator from service', () => {

		const componentManager1: ImageryComponentManager = <any>{
			Id: "1",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		const componentManager2: ImageryComponentManager = <any>{
			Id: "2",
			centerChanged: new EventEmitter<GeoJSON.Point>(),
			positionChanged: new EventEmitter<{id: string, position: MapPosition}>(),
			pointerMove: new EventEmitter<any>(),
			singleClick: new EventEmitter<any>()
		};

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		spyOn(imageryCommunicatorService.instanceRemoved, 'emit');
		imageryCommunicatorService.remove(componentManager2.Id);
		expect(imageryCommunicatorService.instanceRemoved.emit).toHaveBeenCalledWith({
				communicatorsIds: ["1"],
				currentCommunicatorId: "2"
			}
		);

	});
});
