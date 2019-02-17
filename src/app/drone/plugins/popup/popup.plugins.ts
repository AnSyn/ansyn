import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { OpenLayersMap } from "@ansyn/plugins";
import { Store } from '@ngrx/store';
import { Popup } from "./popup";
import { layerPluginType, selectLayers, selectSelectedLayersIds } from "@ansyn/menu-items";
import { AutoSubscription } from 'auto-subscriptions';
import { combineLatest } from 'rxjs';
import { PopupService } from "./popup.service";
import { map } from 'rxjs/operators';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, PopupService]
})
export class PopupPlugins extends BaseImageryPlugin {
	popup: Popup;
	@AutoSubscription
	$activeMapClick = () => combineLatest(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds)).pipe<any>(
		map(([layers, selectedLayers]: [any, any]) => {
			if (layers.some(layer => layer.layerPluginType === layerPluginType.ARCGIS &&
				selectedLayers.includes(layer.id))) {
				this.iMap.mapObject.on('singleclick', this.mapSingleClick)
			} else {
				this.iMap.mapObject.un('singleclick', this.mapSingleClick)
				this.popup.close();
			}
		})
	)

	constructor(protected  store$: Store<any>,
				protected popupService: PopupService) {
		super();
	}

	mapSingleClick = (ev: any) => {
		this.popup.set('searching...');
		this.popup.open(ev.coordinate);
		this.popupService.getInfo(ev).subscribe((info: any) => {
				this.popup.set(this.createPopupMessage(info.body));
			}
		);
	};

	onInit(): void {
		super.onInit();
		this.popup = new Popup();
		this.iMap.mapObject.addOverlay(this.popup.getOverlay());
	}

	onDispose(): void {
		super.onDispose();
		this.popup.destroy();
		this.iMap.mapObject.removeOverlay(this.popup.getOverlay());
	}

	private createPopupMessage({ features }: any) {
		let content = '<div>';
		if (!features || features.length === 0) {
			content += "can't find";
		} else {
			const { attributes: attr } = features[0];
			const text = `<div>
 							<p> ID: ${attr.ID} </p>
 							<p>Update date: ${new Date(attr.Up_Date).toDateString()}</p>
 							<p>Grow category: ${attr.GrowthCat}</p>
 							<p>Grow name: ${attr.GrowthName}</p>
 							<p>Planet year: ${attr.PlantYear ? attr.PlantYear : ''}</p>
 							<p>Dunam: ${attr.Dunam}</p>
 							<p>Yeshuv name: ${attr.YeshuvName}</p>
 							</div>`;
			content += text;
		}
		content += "</div>";
		return content;
	}
}
