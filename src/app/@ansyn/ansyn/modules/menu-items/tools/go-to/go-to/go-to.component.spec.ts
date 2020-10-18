import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { GoToComponent } from './go-to.component';
import { Store, StoreModule } from '@ngrx/store';
import { IToolsState, toolsFeatureKey, ToolsReducer } from '../../reducers/tools.reducer';
import { GoToModule } from '../go-to.module';
import { GoToAction, SetPinLocationModeAction } from '../../actions/tools.actions';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { mapFacadeConfig, ProjectionConverterService } from '@ansyn/map-facade';
import { toolsConfig } from '../../models/tools-config';
import { CoreConfig } from '../../../../core/models/core.config';
import { CoreModule } from '../../../../core/core.module';
import { LoggerConfig } from '../../../../core/models/logger.config';
import { TranslateModule } from '@ngx-translate/core';

describe('GoToComponent', () => {
	let component: GoToComponent;
	let fixture: ComponentFixture<GoToComponent>;
	let store: Store<IToolsState>;
	let projectionConverterService: ProjectionConverterService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [GoToModule,
				HttpClientModule,
				StoreModule.forRoot({ [toolsFeatureKey]: ToolsReducer }),
				CoreModule,
				EffectsModule.forRoot([]),
				TranslateModule.forRoot()
			],
			providers: [
				ProjectionConverterService,
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{
					provide: toolsConfig, useValue: {
						GoTo: {
							from: '',
							to: ''
						}
					}
				},
				{
					provide: mapFacadeConfig, useValue: {
						Proj4: {
							ed50: '+proj=utm +datum=ed50 +zone=${zone} +ellps=intl +units=m + no_defs',
							ed50Customized: ''
						}
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store, ProjectionConverterService], (_store: Store<IToolsState>, _projectionConverterService: ProjectionConverterService) => {
		store = _store;
		projectionConverterService = _projectionConverterService;
		fixture = TestBed.createComponent(GoToComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	describe('submitGoTo', () => {
		it('should dispatch GoToAction with convertByProjectionDatum result', () => {
			spyOn(store, 'dispatch');

			spyOn(projectionConverterService, 'convertByProjectionDatum').and.returnValue([0, 0]);
			spyOn(projectionConverterService, 'isValidConversion').and.returnValue(true);

			component.submitGoTo();
			expect(store.dispatch).toHaveBeenCalledWith(new GoToAction([0, 0]));
		});

		it('"submit" button should call submitGoTo', () => {
			spyOn(component, 'submitGoTo');
			const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
			submitBtn.click();
			fixture.detectChanges();
			expect(component.submitGoTo).toHaveBeenCalled();
		});
	});

	it('togglePinLocation should dispatch SetPinLocationModeAction and toggle pinLocationMode)', () => {
		spyOn(store, 'dispatch');
		component.togglePinLocation();
		expect(store.dispatch).toHaveBeenCalledWith(new SetPinLocationModeAction(!component.pinLocationMode));
	});

	it('close() should change expand to false', () => {
		component.close();
		expect(component.expand).toBeFalsy();
	});


});
