import Translate from 'ol/interaction/Translate';

export class MeasureTranslateInteraction extends Translate {
	constructor(opt) {
		super(opt);
	}

	handleMoveEvent(event) {
		const map = event.map;
		if (map.hasFeatureAtPixel(event.pixel)) {
			const elem = event.map.getViewport();
			const interactions = event.map.getInteractions().getArray();
			const measureInteractions = interactions && interactions.filter(interaction => interaction instanceof MeasureTranslateInteraction);
			let isMeasureHover = false;
			map.forEachFeatureAtPixel(event.pixel, (feature) => {
				measureInteractions.forEach(interaction => {
					const measureFeature = interaction.features_.item(0);
					isMeasureHover = isMeasureHover || feature.getId() === measureFeature.getId();
				})
			});

			if (isMeasureHover) {
				elem.classList.remove((<Translate>this).lastCoordinate_ ? 'ol-grab' : 'ol-grabbing');
				elem.classList.add((<Translate>this).lastCoordinate_ ? 'ol-grabbing' : 'ol-grab');
			} else {
				elem.classList.remove('ol-grab', 'ol-grabbing');
			}
		}
	}
}
