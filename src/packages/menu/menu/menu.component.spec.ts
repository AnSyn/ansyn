import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuComponent } from './menu.component';
import {MenuService} from "../menu.service";
import {MenuItem} from "../menu-item.model";

describe('MenuComponent', () => {
  let menuComponent: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let element: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuComponent ],
      providers:[MenuService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    menuComponent = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(menuComponent).toBeDefined();
  });

  it('componentChanges should call destroyCurrentComponent and buildCurrentComponent', () => {
    spyOn(menuComponent, 'destroyCurrentComponent');
    spyOn(menuComponent, 'buildCurrentComponent');
    menuComponent.componentChanges();
    expect(menuComponent.destroyCurrentComponent).toHaveBeenCalled();
    expect(menuComponent.buildCurrentComponent).toHaveBeenCalled();
  });

  it('destroyCurrentComponent should call factory destroy function and set factory to undefined', () => {
    let fake_factory = {destroy():void {}};
    menuComponent.selected_component_ref = <any> fake_factory;
    spyOn(fake_factory, 'destroy');
    menuComponent.destroyCurrentComponent ();
    expect(fake_factory.destroy).toHaveBeenCalled();
    expect(menuComponent.selected_component_ref).toBeUndefined();
  });

  it('buildCurrentComponent should create factory from selected_item component only when menu is open', () => {
    let mock_menu_item = new MenuItem("one", "fake_comp", "fake/url/to/icon");
    menuComponent['menu_items'] = [mock_menu_item];
    menuComponent['_selected_item_index'] = 0;
    spyOn(menuComponent, 'itemSelected').and.returnValue(true);
    spyOn(menuComponent['componentFactoryResolver'], 'resolveComponentFactory').and.callFake(()=> "fake_ComponentFactory" );
    spyOn(menuComponent.selected_component_elem, 'createComponent').and.callFake(()=> "fake_ComponentRef");
    menuComponent.buildCurrentComponent();
    expect(menuComponent.selected_component_elem.createComponent).toHaveBeenCalledWith("fake_ComponentFactory");
    expect(menuComponent.selected_component_ref).toEqual("fake_ComponentRef");
  });


  it('toggleItem should call selected_item_index setter, toggleItem with "selected_item_index" value should close menu (selected_item_index = -1)', () => {
    spyOn(menuComponent['selectedItemIndexChange'], 'emit');
    menuComponent.toggleItem(1);
    expect(menuComponent['selectedItemIndexChange'].emit).toHaveBeenCalledWith(1);

    menuComponent['_selected_item_index'] = 2;
    menuComponent.toggleItem(2);
    expect(menuComponent['selectedItemIndexChange'].emit).toHaveBeenCalledWith(-1);
  });

  it('isActive should get index and check if selected_item_index equal to index', () => {
    menuComponent['_selected_item_index'] = 6;
    expect(menuComponent.isActive(5)).toBeFalsy();
    expect(menuComponent.isActive(6)).toBeTruthy();
  });

  it('closeMenu should set selected_item_index  with -1', () => {
    spyOn(menuComponent['selectedItemIndexChange'], 'emit');
    menuComponent.closeMenu();
    expect(menuComponent['selectedItemIndexChange'].emit).toHaveBeenCalledWith(-1);
  });

  it('onFinishAnimation should get expand value and change on_animation to false. if expand is false: call componentChanges and if menu open change expand to true', () => {
    let itemSelectedRes = false;
    spyOn(menuComponent, 'componentChanges');
    spyOn(menuComponent, 'itemSelected').and.callFake(() => itemSelectedRes);

    //expand = true
    this.on_animation = true;
    menuComponent.onFinishAnimation(true);
    expect(menuComponent['on_animation']).toBeFalsy();

    //expand = false ; itemSelected() = false
    this.on_animation = true;
    menuComponent.onFinishAnimation(false);
    expect(menuComponent['on_animation']).toBeFalsy();
    expect(menuComponent.componentChanges).toHaveBeenCalled();
    expect(menuComponent['expand']).toBeFalsy();

    //expand = false ; itemSelected() = true
    itemSelectedRes = true;
    this.on_animation = true;
    menuComponent.onFinishAnimation(false);
    expect(menuComponent['on_animation']).toBeFalsy();
    expect(menuComponent.componentChanges).toHaveBeenCalled();
    expect(menuComponent['expand']).toBeTruthy();
  });

  it('ngOnChanges should change expand via 3 parameters. if expand is true componentChanges() should have been call', () => {
    let _selected_item_index:any = true;
    let itemSelectedRes;

    spyOn(menuComponent, 'componentChanges');
    spyOn(menuComponent, 'itemSelected').and.callFake(() => itemSelectedRes);

    // When expand result is false
    itemSelectedRes = false;
    menuComponent.ngOnChanges({_selected_item_index});
    expect(menuComponent.componentChanges).not.toHaveBeenCalled();
    expect(menuComponent['expand']).toBeFalsy();

    // When expand result is true

    itemSelectedRes = true;
    menuComponent.ngOnChanges({_selected_item_index});
    expect(menuComponent.componentChanges).toHaveBeenCalled();
    expect(menuComponent['expand']).toBeTruthy();

  });


});
