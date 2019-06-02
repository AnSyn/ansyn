import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ShowOverlaysFootprintAction } from '../actions/tools.actions';
import { Store, StoreModule } from '@ngrx/store';
import { OverlaysDisplayModeComponent } from './overlays-display-mode.component';
import { toolsFeatureKey, ToolsReducer, toolsStateSelector } from '../reducers/tools.reducer';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CoreConfig } from '../../../core/models/core.config';

describe('overlaysDisplayModeComponent', () => {
	let component: OverlaysDisplayModeComponent;
	let fixture: ComponentFixture<OverlaysDisplayModeComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, StoreModule.forRoot({ [toolsFeatureKey]: ToolsReducer }), TranslateModule],
			declarations: [OverlaysDisplayModeComponent],
			providers: [
				{provide: CoreConfig, useValue: {}}
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		spyOn(store, 'dispatch');

		const fakeStore = new Map<any, any>([
			[toolsStateSelector, { activeOverlaysFootprintMode: 'None' }]
		]);

		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlaysDisplayModeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check that ShowOverlaysFootprintAction is dispatched when visualizerType change', () => {
		component.visualizerType = 'Heatmap';
		expect(store.dispatch).toHaveBeenCalledWith(new ShowOverlaysFootprintAction('Heatmap'));
	});
});
