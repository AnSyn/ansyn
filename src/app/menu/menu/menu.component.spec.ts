import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuComponent } from './menu.component';
import {MenuService} from "../menu.service";

fdescribe('MenuComponent', () => {
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

  it('toggleItem should call selected_item_index setter', () => {
    spyOn(menuComponent['selectedItemIndexChange'], 'emit');
    menuComponent.toggleItem(1);
    expect(menuComponent['selectedItemIndexChange'].emit).toHaveBeenCalledWith(1);
  });



});
