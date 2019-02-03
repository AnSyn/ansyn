import Overlay from "ol/overlay";
import OLMap from 'ol/map';

const STYLEID = 'ANSYNSTYLE';
const STYLE = `.ol-popup {
        position: absolute;
        background-color: white;
        -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 280px;
        color: #000;
      }
      .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
      }
      .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
      }
      .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
      }
      .ol-popup-closer {
        text-decoration: none;
        position: absolute;
        top: 2px;
        right: 8px;
      }
      .ol-popup-closer:after {
        content: "✖";
      }
	`;

export class Popup {
	overlay: Overlay;
	popupContainer: HTMLElement;
	closePopup: HTMLElement;
	content: HTMLElement;
	map: OLMap;

	constructor() {
		if (!document.getElementById(STYLEID)) {
			const style = document.createElement('style');
			style.setAttribute('id', STYLEID);
			style.innerHTML = STYLE;
			document.head.appendChild(style);
		}

		this.popupContainer = document.createElement('div');
		this.popupContainer.setAttribute('class', 'ol-popup');
		this.closePopup = document.createElement('a');
		this.closePopup.setAttribute('class', 'ol-popup-closer');
		this.closePopup.setAttribute('href', '#');
		this.content = document.createElement('div');
		this.popupContainer.appendChild(this.closePopup);
		this.popupContainer.appendChild(this.content);
		this.closePopup.onclick = this.close;
		document.getElementsByTagName('ansyn-imageries-manager')[0].parentElement.appendChild(this.popupContainer);
		this.overlay = new Overlay({
			element: this.popupContainer,
			autoPan: true
		});

	}

	getOverlay() {
		return this.overlay;
	}

	set(value: string) {
		this.content.innerHTML = value;
	}

	close = () => {
		this.closePopup.blur();
		this.overlay.setPosition(undefined);
		return false;
	};

	open(coord) {
		this.overlay.setPosition(coord);
	}

	destroy() {
		this.close();
		this.popupContainer.parentElement.removeChild(this.popupContainer);
	}
}
