export const addHighLight = config => selection => {
	const filters = selection.append('filter');

	filters
		.attr('id', 'highlight')
		.attr('x', '-112.5%')
		.attr('y', '-112.5%')
		.attr('width', '325.0%')
		.attr('height', '325.0%')
		.attr('filterUnits', 'objectBoundingBox');

	filters
		.append('feMorphology')
		.attr('radius', '2')
		.attr('operator', 'dilate')
		.attr('in', 'SourceAlpha')
		.attr('result', 'shadowSpreadOuter1');

	filters
		.append('feGaussianBlur')
		.attr('stdDeviation', '4')
		.attr('in', 'shadowOffsetOuter1')
		.attr('result', 'shadowBlurOuter1');

	filters
		.append('feColorMatrix')
		.attr(
			'values',
			'0 0 0 0 0.97254902   0 0 0 0 0.909803922   0 0 0 0 0.109803922  0 0 0 1 0'
		)
		.attr('type', 'matrix')
		.attr('in', 'shadowBlurOuter1');

	// overlay original SourceGraphic over translated blurred opacity by using
	// feMerge filter. Order of specifying inputs is important!
	const feMerge = filters.append('feMerge');

	feMerge.append('feMergeNode').attr('in', 'offsetBlur');
	feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

	return filters;
};
