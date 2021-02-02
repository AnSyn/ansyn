import { InjectionToken } from '@angular/core';

export const COMMUNICATOR_LOG_MESSAGES = new InjectionToken('COMMUNICATOR_LOG_MESSAGES');

export const communicatorLogMessages = {
	openingAnnotationsContextMenu: `Opening annotations context menu`,
	annotationEditMode: (enable) => `${enable ? 'Enter' : 'Exit'} annotation edit mode`,
	annotationMeasures: (showMeasures) => `${showMeasures ? 'Hiding' : 'Showing'} annotation measures`,
	annotationArea: (showArea) => `${showArea ? 'Hiding' : 'Showing'} annotation area`,
	annotationLabel: (text) => `Changing annotation label to ${text}`,
	annotationLabelSize: (labelSize) => `Changing annotation label size to ${labelSize}`,
	annotationLineStyle: (width, dash) => `Changing annotation line style: width=${width} dash=${dash === 0 ? 'no' : 'yes'}`,
	annotationColors: (colorString) => `Changing annotation colors: ${colorString}`,
	annotationActiveColors: (colorString) => `Changing annotation active colors: ${colorString}`,
	deletingAnnotation: `Deleting annotation`,
	startAnnotationMoveLabel: `Enter annotation move label mode`,
	endAnnotationMoveLabel: `Exit annotation move label mode`,
}
