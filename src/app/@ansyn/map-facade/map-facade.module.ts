import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapEffects } from './effects/map.effects';
import { ImageriesManagerComponent } from './components/imageries-manager/imageries-manager.component';
import { ImageryModule } from '@ansyn/imagery';
import { CommonModule } from '@angular/common';
import { ImageryContainerComponent } from './components/imagery-container/imagery-container.component';
import { FormsModule } from '@angular/forms';
import { mapFeatureKey, MapReducer } from './reducers/map.reducer';
import { StoreModule } from '@ngrx/store';
import { AnnotationContextMenuComponent } from './components/annotation-context-menu/annotation-context-menu.component';
import { ImageryRotationComponent } from './components/imagery-rotation/imagery-rotation.component';
import { ImageryLoaderComponent } from './components/imagery-loader/imagery-loader.component';
import { ImageryTileProgressComponent } from './components/imagery-tile-progress/imagery-tile-progress.component';
import { OverlaySourceTypeNoticeComponent } from './components/overlay-source-type-notice/overlay-source-type-notice.component';
import { MapSearchBoxComponent } from './components/map-search-box/map-search-box.component';
import { GeocoderService } from './services/geocoder.service';
import { AnnotationsWeightComponent } from './components/annotations-weight/annotations-weight.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { AnnotationsColorComponent } from './components/annotations-color/annotations-color.component';
export { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { WelcomeNotificationComponent } from './components/welcome-notification/welcome-notification.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { ToastComponent } from './components/toast/toast.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { InfiniteScrollDirective } from './directives/infinite-scroll.directive';
import { AnimatedEllipsisComponent } from './components/animated-ellipsis/animated-ellipsis.component';
import { AnsynLoaderComponent } from './components/ansyn-loader/ansyn-loader.component';
import { AlertsModule } from './alerts/alerts.module';
import { imageryStatusFeatureKey, ImageryStatusReducer } from './reducers/imagery-status.reducer';
import { AnsynPopoverComponent } from './components/ansyn-popover/ansyn-popover.component';

@NgModule({
	imports: [
		StoreModule.forFeature(mapFeatureKey, MapReducer),
		StoreModule.forFeature(imageryStatusFeatureKey, ImageryStatusReducer),
		EffectsModule.forFeature([MapEffects]),
		ImageryModule,
		CommonModule,
		FormsModule,
		AlertsModule
	],
	providers: [GeocoderService],
	declarations: [
		ImageriesManagerComponent,
		ImageryRotationComponent,
		ImageryContainerComponent,
		AnnotationContextMenuComponent,
		ImageryLoaderComponent,
		ImageryTileProgressComponent,
		OverlaySourceTypeNoticeComponent,
		MapSearchBoxComponent,
		AnnotationsColorComponent,
		AnnotationsWeightComponent,
		ImageryStatusComponent,
		WelcomeNotificationComponent,
		ColorPickerComponent,
		ToastComponent,
		ClickOutsideDirective,
		InfiniteScrollDirective,
		AnimatedEllipsisComponent,
		AnsynLoaderComponent,
		AnsynPopoverComponent
	],
	exports: [
		ImageriesManagerComponent,
		AnnotationsWeightComponent,
		AnnotationsColorComponent,
		ImageryStatusComponent,
		WelcomeNotificationComponent,
		ColorPickerComponent,
		ToastComponent,
		ClickOutsideDirective,
		InfiniteScrollDirective,
		AnimatedEllipsisComponent,
		AnsynLoaderComponent,
		AnsynPopoverComponent
	]
})

export class MapFacadeModule {
	constructor() {
	}
}
