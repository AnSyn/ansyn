import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UploadListComponent } from './upload-list.component';
import { MatProgressBar } from '@angular/material';
import { Store, StoreModule } from '@ngrx/store';
import { UploadItemComponent } from '../upload-item/upload-item.component';
import { MultipleOverlaysSource } from '@ansyn/overlays';
import { mapFeatureKey, MapReducer, selectActiveMapId } from '@ansyn/map-facade';
import { of } from 'rxjs';
import { MoveToUploadOverlay } from '../../actions/uploads.actions';
import { selectUploadList } from '../../reducers/uploads.reducer';
import { TBOverlaySourceType } from '../../../overlay-source-provider/tb-source-provider';

const FakeMultipleOverlaysSource = {
	[TBOverlaySourceType]: {
		parseData: () => ({ id: 'fakeOverlay' })
	}
};

describe('UploadListComponent', () => {
	let component: UploadListComponent;
	let fixture: ComponentFixture<UploadListComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [mapFeatureKey]: MapReducer })],
			providers: [
				{
					provide: MultipleOverlaysSource,
					useValue: FakeMultipleOverlaysSource
				}
			],
			declarations: [UploadListComponent, UploadItemComponent, MatProgressBar]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(UploadListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;

		const mockStore = new Map<any, any>([
			[selectActiveMapId, 'activeMapId'],
			[selectUploadList, []]
		]);

		spyOn(store, 'select').and.callFake((selector) => {
			return of(mockStore.get(selector));
		});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('moveToUpload should fire MoveToUpload Action', () => {
		spyOn(store, 'dispatch');
		const event = { '0': 'TB_LAYER'};
		component.moveToUpload(event);
		expect(store.dispatch).toHaveBeenCalledWith(new MoveToUploadOverlay({ overlay: <any> { id: 'fakeOverlay' }, mapId: 'activeMapId' }))
	});

	it('clearList should clear the list', () => {
		expect(component.clearList).toBeDefined()

	})
});
