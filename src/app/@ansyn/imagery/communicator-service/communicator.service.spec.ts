import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { ImageryCommunicatorService } from './communicator.service';
import { EventEmitter } from '@angular/core';
import { IImageryMapPosition } from '../model/case-map-position.model';
import { CommunicatorEntity, IMapInstanceChanged } from './communicator.entity';

describe('ImageryCommunicatorService', () => {
	let imageryCommunicatorService: ImageryCommunicatorService;
	const componentManager1: CommunicatorEntity = <any>{
		id: '1',
		positionChanged: new EventEmitter<{ id: string, position: IImageryMapPosition }>(),
		pointerMove: new EventEmitter<any>(),
		contextMenu: new EventEmitter<any>(),
		imageryCommunicatorService: { instanceCreated: new EventEmitter<any>() },
		mapInstanceChanged: new EventEmitter<IMapInstanceChanged>(),
		plugins: []
	};

	const componentManager2: CommunicatorEntity = <any>{
		id: '2',
		positionChanged: new EventEmitter<{ id: string, position: IImageryMapPosition }>(),
		imageryCommunicatorService: { instanceCreated: new EventEmitter<any>() },
		mapInstanceChanged: new EventEmitter<IMapInstanceChanged>(),
		plugins: []
	};

	beforeEach(waitForAsync(() => {
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

		expect((<any>(imageryCommunicatorService.provide(componentManager2.id)))).toEqual(componentManager2);
		expect((<any>(imageryCommunicatorService.provide(componentManager1.id)))).toEqual(componentManager1);
		expect(imageryCommunicatorService.provide('3')).toEqual(null);
	});

	it('communicators should return object containing the communicators', () => {

		imageryCommunicatorService.createCommunicator(componentManager1);
		imageryCommunicatorService.createCommunicator(componentManager2);

		const communicatorsObject = imageryCommunicatorService.communicators;
		expect((<any>(communicatorsObject[componentManager1.id]))).toEqual(componentManager1);
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
