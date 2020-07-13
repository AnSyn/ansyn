import { IVisualizerEntity } from '@ansyn/imagery';

export function checkEntitiesDiff(oldEntity: IVisualizerEntity, entity: IVisualizerEntity): boolean {
	const isShowMeasuresDiff = oldEntity.showMeasures !== entity.showMeasures;
	const isShowAreaDiff = oldEntity.showArea !== entity.showArea;
	const isLabelDiff = oldEntity.label !== entity.label;
	const isFillDiff = oldEntity.style.initial.fill !== entity.style.initial.fill;
	const isStrokeWidthDiff = oldEntity.style.initial['stroke-width'] !== entity.style.initial['stroke-width'];
	const isStrokeDiff = oldEntity.style.initial['stroke'] !== entity.style.initial['stroke'];
	const isOpacityDiff = ['fill-opacity', 'stroke-opacity'].filter((o) => oldEntity.style.initial[o] !== entity.style.initial[o]);
	return isShowMeasuresDiff || isLabelDiff || isFillDiff || isStrokeWidthDiff || isStrokeDiff || isOpacityDiff.length > 0 || isShowAreaDiff;
}
