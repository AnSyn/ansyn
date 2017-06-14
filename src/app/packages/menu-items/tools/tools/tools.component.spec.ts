import { async, ComponentFixture, TestBed, inject  } from '@angular/core/testing';
import { StartMouseShadow, StopMouseShadow } from '../actions/tools.actions';
import { Store,StoreModule } from '@ngrx/store';
import { ToolsComponent } from './tools.component';

describe('ToolsComponent', () => {
    let component: ToolsComponent;
    let fixture: ComponentFixture <ToolsComponent> ;
    let store: Store <any> ;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                declarations: [ToolsComponent],
                imports: [StoreModule.provideStore({ cases: {}})]
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
    	expect(component.flags.get('shadow_mouse')).toBe(false);
    	button.click();
    	expect(store.dispatch).toHaveBeenCalledWith(new StartMouseShadow());
    	expect(component.flags.get('shadow_mouse')).toBe(true);
    	button.click();
    	expect(store.dispatch).toHaveBeenCalledWith(new StopMouseShadow());
    	expect(component.flags.get('shadow_mouse')).toBe(false);
    	
    });
});
