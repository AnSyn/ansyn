import { async, ComponentFixture, TestBed, inject  } from '@angular/core/testing';
import { StartMouseShadow, StopMouseShadow } from '../actions/tools.actions';
import { Store,StoreModule } from '@ngrx/store';
import { ToolsComponent } from './tools.component';
import { ToolsReducer } from '../reducers/tools.reducer';
import { MockComponent } from '@ansyn/core/test/mock-component';

describe('ToolsComponent', () => {
    let component: ToolsComponent;
    let fixture: ComponentFixture <ToolsComponent> ;
    let store: Store <any> ;

	const mock_go_to = MockComponent({selector: 'ansyn-go-to', inputs: ['expand', 'disabled'], outputs: ['onGoTo', 'expandChange']});
	const mock_overlays_display_mode = MockComponent({selector: 'ansyn-overlays-display-mode', inputs: ['expand', 'disabled', 'modeOn'], outputs: ['expandChange', 'modeOnChange']});

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                imports: [StoreModule.provideStore({ tools: ToolsReducer})],
				declarations: [ToolsComponent, mock_go_to, mock_overlays_display_mode]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(inject([Store], (_store: Store <any> ) => {
    	spyOn(_store,'dispatch');
    	store = _store;
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('check the mouse shadow toggle button',() =>{
    	const button = fixture.debugElement.nativeElement.querySelector('.shadow-mouse-button');
        component.flags = new Map();
        component.flags.set('shadow_mouse',false);

    	//expect(component.flags.get('shadow_mouse')).toBe(false);
    	button.click();
    	expect(store.dispatch).toHaveBeenCalledWith(new StartMouseShadow());

        component.flags.set('shadow_mouse',true);
        //expect(component.flags.get('shadow_mouse')).toBe(true);
    	button.click();
    	expect(store.dispatch).toHaveBeenCalledWith(new StopMouseShadow());
    	//expect(component.flags.get('shadow_mouse')).toBe(false);

    });

    it('toggleExpandGoTo should toggle expandGoTo and close expandOverlaysDisplayMode', () => {
		component.expandGoTo = true;
    	component.toggleExpandGoTo();
		expect(component.expandGoTo).toBeFalsy();
		component.expandOverlaysDisplayMode = true;
		component.toggleExpandGoTo();
		expect(component.expandGoTo).toBeTruthy();
		expect(component.expandOverlaysDisplayMode).toBeFalsy();
	});

	it('toggleExpandVisualizers should toggle expandOverlaysDisplayMode and close expandGoTo', () => {
		component.expandOverlaysDisplayMode = true;
		component.toggleExpandVisualizers();
		expect(component.expandOverlaysDisplayMode).toBeFalsy();
		component.expandGoTo = true;
		component.toggleExpandVisualizers();
		expect(component.expandOverlaysDisplayMode).toBeTruthy();
		expect(component.expandGoTo).toBeFalsy();
	});

	it('toggleExpandVisualizers should toggle expandOverlaysDisplayMode and close expandGoTo', () => {
		component.displayModeOn = true;
		fixture.detectChanges();
		expect(component.displayOverlayDiv.nativeElement.classList.contains('active')).toBeTruthy();
		component.displayModeOn = false;
		fixture.detectChanges();
		expect(component.displayOverlayDiv.nativeElement.classList.contains('active')).toBeFalsy();
	});
});
