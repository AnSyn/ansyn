import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { StartMouseShadow, StopMouseShadow } from '../actions/tools.actions';
import { Store, StoreModule } from '@ngrx/store';
import { ToolsComponent } from './tools.component';
import { toolsFeatureKey, ToolsReducer } from '../reducers/tools.reducer';
import { MockComponent } from '@ansyn/core/test/mock-component';


describe('ToolsComponent', () => {
	let component: ToolsComponent;
	let fixture: ComponentFixture<ToolsComponent>;
	let store: Store<any>;

	const mockAnnotationsControl = MockComponent({ selector: 'ansyn-annotations-control', inputs: ['expand'] });
	const mockGoTo = MockComponent({
		selector: 'ansyn-go-to',
		inputs: ['expand', 'disabled'],
		outputs: ['onGoTo', 'expandChange']
	});
	const mockOverlaysDisplayMode = MockComponent({
		selector: 'ansyn-overlays-display-mode',
		inputs: ['expand', 'disabled', 'modeOn'],
		outputs: ['expandChange', 'modeOnChange']
	});
	const mockImageManualProcessing = MockComponent({
		selector: 'ansyn-image-processing-control',
		inputs: ['expand', 'initParams'],
		outputs: ['isActive']
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [toolsFeatureKey]: ToolsReducer })],
			declarations: [ToolsComponent, mockGoTo, mockOverlaysDisplayMode, mockAnnotationsControl, mockImageManualProcessing]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ToolsComponent);
		// Add manualProcessingControls function: resetAllParams (accessible from ToolsComponent)
		component = fixture.componentInstance;
		component.imageProcessInitParams = null;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		spyOn(_store, 'dispatch');
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check the mouse shadow toggle button', () => {
		const button = fixture.debugElement.nativeElement.querySelector('button:first-child');
		component.flags = new Map();
		component.flags.set('shadowMouse', false);

		// expect(component.flags.get('shadowMouse')).toBe(false);
		button.click();
		expect(store.dispatch).toHaveBeenCalledWith(new StartMouseShadow());

		component.flags.set('shadowMouse', true);
		button.click();
		expect(store.dispatch).toHaveBeenCalledWith(new StopMouseShadow());
	});
	it('on toggleAutoImageProcessing should nullify imageProcessInitParams', () => {
		component.flags.set('autoImageProcessing', false);
		const button = fixture.debugElement.nativeElement.querySelector('div.image-auto-processing button');
		button.click();
		expect(component.imageProcessInitParams).toBeNull();
	});

	it('toggleExpandVisualizers should get classes via displayModeOn / expandOverlaysDisplayMode values', () => {
		const displayOverlayButton: HTMLButtonElement = fixture.nativeElement.querySelector('.display-overlay-visualizer button');
		component.displayModeOn = true;
		fixture.detectChanges();
		expect(displayOverlayButton.classList.contains('mode-on')).toBeTruthy();
		component.displayModeOn = false;
		fixture.detectChanges();
		expect(displayOverlayButton.classList.contains('mode-on')).toBeFalsy();
	});

	it('toogle annotation menu open', () => {
		component.userAnnotationsToolOpen = false;
		component.toggleAnnotationMenu(true);
		const args = store.dispatch['calls'].mostRecent();
		expect(store.dispatch).toHaveBeenCalledTimes(3);
		expect(args.args[0].payload.operation).toBe('show');
	});

	it('toogle annotation menu close', () => {
		component.userAnnotationsToolOpen = true;
		component.toggleAnnotationMenu(false);
		const args = store.dispatch['calls'].mostRecent();
		expect(store.dispatch).toHaveBeenCalledTimes(4);
		expect(args.args[0].payload.operation).toBe('hide');
	});
});
