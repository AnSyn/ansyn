import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { GoToExpandAction, StartMouseShadow, StopMouseShadow } from '../actions/tools.actions';
import { Store, StoreModule } from '@ngrx/store';
import { ToolsComponent } from './tools.component';
import { ToolsReducer } from '../reducers/tools.reducer';
import { MockComponent } from '@ansyn/core/test/mock-component';


describe('ToolsComponent', () => {
	let component: ToolsComponent;
	let fixture: ComponentFixture<ToolsComponent>;
	let store: Store<any>;

	const mock_annotations_control = MockComponent({ selector: 'ansyn-annotations-control', inputs: ['expand'] });
	const mock_go_to = MockComponent({
		selector: 'ansyn-go-to',
		inputs: ['expand', 'disabled'],
		outputs: ['onGoTo', 'expandChange']
	});
	const mock_overlays_display_mode = MockComponent({
		selector: 'ansyn-overlays-display-mode',
		inputs: ['expand', 'disabled', 'modeOn'],
		outputs: ['expandChange', 'modeOnChange']
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ tools: ToolsReducer })],
			declarations: [ToolsComponent, mock_go_to, mock_overlays_display_mode, mock_annotations_control]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ToolsComponent);
		component = fixture.componentInstance;
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
		component.flags.set('shadow_mouse', false);

		// expect(component.flags.get('shadow_mouse')).toBe(false);
		button.click();
		expect(store.dispatch).toHaveBeenCalledWith(new StartMouseShadow());

		component.flags.set('shadow_mouse', true);
		// expect(component.flags.get('shadow_mouse')).toBe(true);
		button.click();
		expect(store.dispatch).toHaveBeenCalledWith(new StopMouseShadow());
		// expect(component.flags.get('shadow_mouse')).toBe(false);

	});

	it('toggleExpandGoTo should toggle expandGoTo and close expandOverlaysDisplayMode', () => {
		component.expandGoTo = true;
		component.toggleExpandGoTo();
		expect(store.dispatch).toHaveBeenCalledWith(new GoToExpandAction(!component.expandGoTo));
		expect(component.expandOverlaysDisplayMode).toBeFalsy();
	});

	it('toggleExpandVisualizers should toggle expandOverlaysDisplayMode and close expandGoTo', () => {
		component.expandOverlaysDisplayMode = true;
		component.toggleExpandVisualizers();
		expect(store.dispatch).toHaveBeenCalledWith(new GoToExpandAction(false));
		component.toggleExpandVisualizers();
		expect(component.expandOverlaysDisplayMode).toBeTruthy();
	});

	it('toggleExpandVisualizers should get classes via displayModeOn / expandOverlaysDisplayMode values', () => {
		const displayOverlayButton: HTMLButtonElement = fixture.nativeElement.querySelector('.display-overlay-visualizer button');
		component.displayModeOn = true;
		fixture.detectChanges();
		expect(displayOverlayButton.classList.contains('mode-on')).toBeTruthy();
		component.displayModeOn = false;
		fixture.detectChanges();
		expect(displayOverlayButton.classList.contains('mode-on')).toBeFalsy();
		component.expandOverlaysDisplayMode = true;
		fixture.detectChanges();
		expect(displayOverlayButton.classList.contains('active')).toBeTruthy();
		component.expandOverlaysDisplayMode = false;
		fixture.detectChanges();
		expect(displayOverlayButton.classList.contains('active')).toBeFalsy();
	});

	it('toogle annotation menu open', () => {
		component.userAnnotationsToolOpen = false;
		component.toggleAnnotationMenu();
		const args = store.dispatch['calls'].mostRecent();
		expect(args.args[0].payload.action).toBe('show');

	});

	it('toogle annotation menu close', () => {
		component.userAnnotationsToolOpen = true;
		component.toggleAnnotationMenu();
		const args = store.dispatch['calls'].mostRecent();
		expect(args.args[0].payload.action).toBe('endDrawing');
	});
});
