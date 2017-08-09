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

	const mock_go_to = MockComponent({selector: 'ansyn-go-to', inputs: ['expand'], outputs: ['onGoTo', 'expandChange']});
	const mock_visualizer = MockComponent({selector: 'ansyn-visualizers', inputs: ['expand', 'visualizersChecked'], outputs: ['expandChange', 'visualizersCheckedChange']});

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                imports: [StoreModule.provideStore({ tools: ToolsReducer})],
				declarations: [ToolsComponent, mock_go_to, mock_visualizer]
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

    it('toggleExpandGoTo should toggle expandGoTo and close expandVisualizers', () => {
		component.expandGoTo = true;
    	component.toggleExpandGoTo();
		expect(component.expandGoTo).toBeFalsy();
		component.expandVisualizers = true;
		component.toggleExpandGoTo();
		expect(component.expandGoTo).toBeTruthy();
		expect(component.expandVisualizers).toBeFalsy();
	});

	it('toggleExpandVisualizers should toggle expandVisualizers and close expandGoTo', () => {
		component.expandVisualizers = true;
		component.toggleExpandVisualizers();
		expect(component.expandVisualizers).toBeFalsy();
		component.expandGoTo = true;
		component.toggleExpandVisualizers();
		expect(component.expandVisualizers).toBeTruthy();
		expect(component.expandGoTo).toBeFalsy();
	});
});
