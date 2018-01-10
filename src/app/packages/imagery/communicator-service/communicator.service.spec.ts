import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryCommunicatorService } from './communicator.service';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';
import { EventEmitter } from '@angular/core';
import { ICaseMapPosition } from '@ansyn/core/models/case-map-position.model';

describe('ImageryCommunicatorService', () => {
	let imageryCommunicatorService: ImageryCommunicatorService;
	const componentManager1: ImageryComponentManager = <any>{
		id: '1',
		centerChanged: new EventEmitter<GeoJSON.Point>(),
		positionChanged: new EventEmitter<{ id: string, position: ICaseMapPosition }>(),
		pointerMove: new EventEmitter<any>(),
		singleClick: new EventEmitter<any>(),
		contextMenu: new EventEmitter<any>(),
		mapInstanceChanged: new EventEmitter<{ id: string, oldMapInstanceName: string, newMapInstanceName: string }>()
	};

	const componentManager2: ImageryComponentManager = <any>{
		id: '2',
		centerChanged: new EventEmitter<GeoJSON.Point>(),
		positionChanged: new EventEmitter<{ id: string, position: ICaseMapPosition }>(),
		pointerMove: new EventEmitter<any>(),
		singleClick: new EventEmitter<any>(),
		contextMenu: new EventEmitter<any>(),
		mapInstanceChanged: new EventEmitter<{ id: string, oldMapInstanceName: string, newMapInstanceName: string }>()
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
		expect(imageryCommunicatorService.instanceCreated.emit).toHaveBeenCalledWith({
				communicatorIds: ['1'],
				currentCommunicatorId: '1'
			}
		);
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

	it('replaceCommunicatorId should replace the communicator Id', () => {

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		imageryCommunicatorService.replaceCommunicatorId(componentManager2.id, '3');

		expect(imageryCommunicatorService.provide('2')).toEqual(null);
		expect((<any>(imageryCommunicatorService.provide('3')))._manager).toEqual(componentManager2);
		expect(componentManager2.id).toEqual('3');
	});

	it('remove should remove the communicator from service', () => {

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		spyOn(imageryCommunicatorService.instanceRemoved, 'emit');
		const id = componentManager2.id;
		imageryCommunicatorService.remove(id);
		expect(imageryCommunicatorService.instanceRemoved.emit).toHaveBeenCalledWith({
				communicatorIds: [componentManager1.id],
				currentCommunicatorId: id
			}
		);
	});
});
