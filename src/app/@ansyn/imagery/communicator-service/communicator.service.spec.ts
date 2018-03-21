import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryCommunicatorService } from './communicator.service';
import { ImageryComponentManager, MapInstanceChanged } from '../imagery/manager/imagery.component.manager';
import { EventEmitter } from '@angular/core';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';

describe('ImageryCommunicatorService', () => {
	let imageryCommunicatorService: ImageryCommunicatorService;
	const componentManager1: ImageryComponentManager = <any>{
		id: '1',
		centerChanged: new EventEmitter<GeoJSON.Point>(),
		positionChanged: new EventEmitter<{ id: string, position: CaseMapPosition }>(),
		pointerMove: new EventEmitter<any>(),
		singleClick: new EventEmitter<any>(),
		contextMenu: new EventEmitter<any>(),
		imageryCommunicatorService: { instanceCreated: new EventEmitter<any>() },
		mapInstanceChanged: new EventEmitter<MapInstanceChanged>(),
		plugins: []
	};

	const componentManager2: ImageryComponentManager = <any>{
		id: '2',
		centerChanged: new EventEmitter<GeoJSON.Point>(),
		positionChanged: new EventEmitter<{ id: string, position: CaseMapPosition }>(),
		pointerMove: new EventEmitter<any>(),
		singleClick: new EventEmitter<any>(),
		contextMenu: new EventEmitter<any>(),
		imageryCommunicatorService: { instanceCreated: new EventEmitter<any>() },
		mapInstanceChanged: new EventEmitter<MapInstanceChanged>(),
		plugins: []
	};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [],
			providers: [ImageryCommunicatorService]
		}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should create "imageryCommunicatorService" service', () => {
		expect(imageryCommunicatorService).toBeTruthy();
	});

	it('createCommunicator should raise instanceCreated event', () => {

		spyOn(imageryCommunicatorService.instanceCreated, 'emit');
		imageryCommunicatorService.createCommunicator(componentManager1);
		expect(imageryCommunicatorService.instanceCreated.emit).toHaveBeenCalledWith({ id: '1' });
	});

	it('provide Communicator should return expected communicator', () => {

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		expect((<any>(imageryCommunicatorService.provide(componentManager2.id)))._manager).toEqual(componentManager2);
		expect((<any>(imageryCommunicatorService.provide(componentManager1.id)))._manager).toEqual(componentManager1);
		expect(imageryCommunicatorService.provide('3')).toEqual(null);
	});

	it('communicators should return object containing the communicators', () => {

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		const communicatorsObject = imageryCommunicatorService.communicators;
		expect((<any>(communicatorsObject[componentManager1.id]))._manager).toEqual(componentManager1);
	});

	it('communicatorsAsArray should return array of communicators', () => {

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		const communicatorsArray = imageryCommunicatorService.communicatorsAsArray();
		expect(communicatorsArray.length).toEqual(2);
	});

	it('remove should remove the communicator from service', () => {

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		spyOn(imageryCommunicatorService.instanceRemoved, 'emit');
		const id = componentManager2.id;
		imageryCommunicatorService.remove(id);
		expect(imageryCommunicatorService.instanceRemoved.emit).toHaveBeenCalledWith({ id });
	});
});
