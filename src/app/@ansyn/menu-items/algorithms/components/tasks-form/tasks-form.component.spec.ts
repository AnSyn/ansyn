import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksFormComponent } from './tasks-form.component';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { AnsynFormsModule, Overlay } from '@ansyn/core';
import { TranslateModule } from '@ngx-translate/core';
import { AlgorithmsService } from '../../services/algorithms.service';
import { EffectsModule } from '@ngrx/effects';
import { AlgorithmsRemoteService } from '../../services/algorithms-remote.service';

describe('TasksFormComponent', () => {
	let component: TasksFormComponent;
	let fixture: ComponentFixture<TasksFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				TasksFormComponent
			],
			imports: [
				FormsModule,
				AnsynFormsModule,
				TranslateModule.forRoot(),
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			],
			providers: [
				{
					provide: AlgorithmsService,
					useValue: {
						config: {}
					}
				},
				{
					provide: AlgorithmsRemoteService,
					useValue: {}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('checkForErrors()', () => {
		let overlays: Overlay[];
		beforeEach(() => {
			spyOn(component, 'showError');
			overlays = ['a', 'b'].map((id) => new Overlay({ id: id }));
			component.MIN_NUM_OF_OVERLAYS = 2;
			component.configService.config = {
				alg_1: {
					maxOverlays: 2,
					timeEstimationPerOverlayInMinutes: 10,
					regionLengthInMeters: 100,
					sensorNames: []
				}
			};
			component.algName = 'alg_1';
			component.task = {
				id: '21',
				name: '21',
				overlays: overlays,
				masterOverlay: overlays[0],
				region: {
					type: 'Point'
				}
			}
		});
		it('should set empty message by default', () => {
			component.checkForErrors();
			expect(component.showError).toHaveBeenCalledWith('');
		});
		it('should check minimum no. of overlays', () => {
			overlays.pop();
			component.checkForErrors();
			expect(component.showError).toHaveBeenCalledWith(`The number of selected overlays 1 should be at least 2`);
		});
		it('should check maximum no. of overlays', () => {
			overlays.push(new Overlay({}));
			component.checkForErrors();
			expect(component.showError).toHaveBeenCalledWith(`The number of selected overlays 3 should be at most 2`);
		});
		it('should check existence of master overlay', () => {
			component.task.masterOverlay = null;
			component.checkForErrors();
			expect(component.showError).toHaveBeenCalledWith('No master overlay selected');
		});
	});
});
