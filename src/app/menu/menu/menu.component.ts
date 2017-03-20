import {
  Component, ComponentFactoryResolver, ComponentRef, ViewChild, ViewContainerRef, ElementRef, Input, Output,
  EventEmitter, OnChanges, SimpleChanges, AnimationEntryMetadata, trigger, state, style, transition, animate
} from '@angular/core';
import {MenuItem} from "../menu-item.model";

const DEFAULT_WIDTH = 60

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
  @Input("width") private width:number = DEFAULT_WIDTH;
  @Output("selectedItemIndexChange") private selectedItemIndexChange:EventEmitter<any> = new EventEmitter();
  @ViewChild("container") container:ElementRef;
  @ViewChild("selected_component_elem", {read: ViewContainerRef}) selected_component_elem:ViewContainerRef;

  selected_component_ref: ComponentRef<any>;
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
      let expand_result = this.itemSelected() && (!this.selected_component_ref || this.on_animation);
      if(expand_result) this.componentChanges();
      this.expand = expand_result;
    }
  }

  componentChanges() {
    this.destroyCurrentComponent();
    this.buildCurrentComponent();
  }

  destroyCurrentComponent() {
    if(this.selected_component_ref) {
      this.selected_component_ref.destroy();
      this.selected_component_ref = undefined;
    }
  }

  buildCurrentComponent() {
    if(this.itemSelected()) {
      let factory = this.componentFactoryResolver.resolveComponentFactory(this.selected_item.component);
      this.selected_component_ref = this.selected_component_elem.createComponent(factory);
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

  itemNotSelected():boolean {
    return this.selected_item == undefined;
  }

  itemSelected():boolean {
    return !this.itemNotSelected();
  }

  onStartAnimation(expand) {
    if(this.itemSelected()) this.on_animation = true;
  }

  onFinishAnimation(expand){
    this.on_animation = false;

    if(!expand){
      this.componentChanges();
      if(this.itemSelected()) this.expand = true;
    }
  }
}
