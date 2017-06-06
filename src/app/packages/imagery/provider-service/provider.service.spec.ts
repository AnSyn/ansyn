/**
 * Created by AsafMas on 08/05/2017.
 */

import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryProviderService } from './provider.service';

describe('ImageryProviderService', () => {
	let imageryProviderService: ImageryProviderService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({declarations: [], providers: [ ImageryProviderService]}).compileComponents();
	}));

	beforeEach(inject([ImageryProviderService], (_ImageryProviderService) => {
		imageryProviderService = _ImageryProviderService;
	}));

	it('should create "ImageryProviderService" service', () => {
		expect(ImageryProviderService).toBeTruthy();
	});
});
