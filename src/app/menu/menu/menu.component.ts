import {
  Component, ComponentFactoryResolver, ComponentRef, ViewChild, ViewContainerRef, ElementRef, Input, Output,
  EventEmitter, OnChanges, SimpleChanges, AnimationEntryMetadata, trigger, state, style, transition, animate
} from '@angular/core';
import {MenuItem} from "../menu-item.model";

const animations: AnimationEntryMetadata[] = [
  trigger(
    'expand', [
      state('true', style({
        transform: 'translate(0%)'
      })),
      state('false', style({
        transform: 'translate(-100%)'
      })),
      transition('1 => 0', animate('0.15s ease-in-out')),
      transition('0 => 1', animate('0.25s ease-in-out'))
    ]
  )
];

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['menu.component.scss'],
  animations
})

export class MenuComponent implements OnChanges {

  @Input("selectedItemIndex") private _selected_item_index:number;
  @Input("menuItems") private menu_items:MenuItem[];
  @Output("selectedItemIndexChange") private selectedItemIndexChange:EventEmitter<any> = new EventEmitter();
  @ViewChild("container") container:ElementRef;
  @ViewChild("selected_component_elem", {read: ViewContainerRef}) selected_component_elem:ViewContainerRef;

  selected_component_factory: ComponentRef<any>;
  private on_animation:boolean = false;
  private expand:boolean = false;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  set selected_item_index(value: number) {
    this.selectedItemIndexChange.emit(value);
  }

  get selected_item_index (): number {
    return this._selected_item_index;
  }

  get selected_item():MenuItem {
    return this.menu_items[this.selected_item_index];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes["_selected_item_index"]) {
      if(this.isMenuOpen() && !this.selected_component_factory) {
        this.componentChanges();
        this.expand = true;
      } else {
        if(this.on_animation && this.isMenuOpen() ){
          this.componentChanges();
        } else {
          this.expand = false;
        }
      }
    }
  }

  componentChanges() {
    this.destroyCurrentComponent();
    this.buildCurrentComponent();
  }

  destroyCurrentComponent() {
    if(this.selected_component_factory) {
      this.selected_component_factory.destroy();
      this.selected_component_factory = undefined;
    }
  }

  buildCurrentComponent() {
    if(this.isMenuOpen()) {
      let factory = this.componentFactoryResolver.resolveComponentFactory(this.selected_item.component);
      this.selected_component_factory = this.selected_component_elem.createComponent(factory);
    }
  }

  toggleItem(index:number) {
    index = this.isActive(index) ? -1 : index;
    this.selected_item_index = index;
  }

  isActive(index:number){
    return this.selected_item_index == index;
  }

  closeMenu():void {
    this.selected_item_index = -1;
  }

  isMenuClose():boolean {
    return this.selected_item == undefined;
  }

  isMenuOpen():boolean {
    return !this.isMenuClose();
  }

  onStartExpandAnimation() {
    if(this.isMenuOpen()) this.on_animation = true;
  }

  onEndExpandAnimation(expand){
    this.on_animation = false;

    if(!expand){
      this.componentChanges();
      if(this.isMenuOpen()) this.expand = true;
    }
  }
}
