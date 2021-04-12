import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotationLayersComponent } from './annotation-layers.component';
import { ILayerState, layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { layersConfig } from '../../services/data-layers.service';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SetActiveAnnotationLayer } from '../../actions/layers.actions';
import { SetSubMenu } from '../../../../status-bar/components/tools/actions/tools.actions';
import { SubMenuEnum } from '../../../../status-bar/components/tools/models/tools.model';
import { SetToastMessageAction } from '@ansyn/map-facade';

const limitError = 'error';
describe('AnnotationLayersComponent', () => {
	let component: AnnotationLayersComponent;
	let fixture: ComponentFixture<AnnotationLayersComponent>;
	let store: Store<ILayerState>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationLayersComponent],
			imports: [
				StoreModule.forRoot({ [layersFeatureKey]: LayersReducer }),
				TranslateModule.forRoot()
			],
			providers: [
				{
					provide: layersConfig, useValue: {
						limit: 2,
						limitError: limitError
					}
				},
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store) => {
		fixture = TestBed.createComponent(AnnotationLayersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
		spyOn(component.getLayers$, 'pipe').and.returnValue(of([]))
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});


	it('openLayersTools should fire SetActiveAnnotationLayer and SetSubMenu actions', () => {
		spyOn(store, 'dispatch');
		const id = 'id';
		component.openLayersTools(id);
		expect(store.dispatch).toHaveBeenCalledWith(new SetActiveAnnotationLayer(id));
		expect(store.dispatch).toHaveBeenCalledWith(new SetSubMenu(SubMenuEnum.annotations));
	});

	it('notifyIfAddLayerNotAllowed if annotationLayerExceedLimit is true', () => {
		spyOn(store, 'dispatch');
		component.annotationLayerExceedLimit = true;
		component.notifyIfAddLayerNotAllowed();
		expect(store.dispatch).toHaveBeenCalledWith(new SetToastMessageAction({ toastText: limitError }));
	})
});
