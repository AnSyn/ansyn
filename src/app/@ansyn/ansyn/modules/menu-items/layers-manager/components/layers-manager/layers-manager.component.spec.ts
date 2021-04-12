import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { LayersManagerComponent } from './layers-manager.component';
import { Store, StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { of } from 'rxjs';
import { MockComponent } from '../../../../core/test/mock-component';
import { MockPipe } from '../../../../core/test/mock-pipe';
import { TranslateService } from '@ngx-translate/core';

describe('LayersManagerComponent', () => {
	let component: LayersManagerComponent;
	let fixture: ComponentFixture<LayersManagerComponent>;
	const mockTranslatePipe = MockPipe('translate');

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[layersFeatureKey]: LayersReducer
				})
			],
			declarations: [
				LayersManagerComponent,
				mockTranslatePipe
			],
			providers: [
				{ provide: TranslateService, useValue: { instant: (x) => x } }
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		spyOn(_store, 'pipe').and.returnValue(of([]));
		fixture = TestBed.createComponent(LayersManagerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
