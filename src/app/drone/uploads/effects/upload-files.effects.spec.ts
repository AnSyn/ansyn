import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { UploadFilesEffects } from './upload-files.effects';
import { UploadsConfig } from '../config/uploads-config';
import { HttpClientModule } from '@angular/common/http';
import { uploadsFeatureKey, UploadsReducer } from '../reducers/uploads.reducer';

describe('uploadFilesEffects', () => {
	let uploadFilesEffect: UploadFilesEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[uploadsFeatureKey]: UploadsReducer
				}),
				HttpClientModule
			],
			providers: [
				UploadFilesEffects,
				{ provide: UploadsConfig, useValue: {} },
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([UploadFilesEffects], (_uploadFileEffects: UploadFilesEffects) => {
		uploadFilesEffect = _uploadFileEffects;
	}));

	it('should be defined', () => {
		expect(uploadFilesEffect).toBeDefined();
	});

});
