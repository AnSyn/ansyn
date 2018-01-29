import { metaballs } from '../metaballs';
import { highlights } from '../highlights';
import shapesFactory from './shapes';
import { delimiters } from './delimiters';
import dropsFactory from './drops';
import labelsFactory from './labels';
import lineSeparatorFactory from './lineSeparator';
import { boolOrReturnValue, drawBottomAxis, drawTopAxis } from './xAxis';

export default (svg, dimensions, scales, configuration) => {
	const defs = svg.append('defs');
	const labelsWidth = configuration.leftWidth;
	const width = dimensions.width - labelsWidth;
	defs
		.append('clipPath')
		.attr('id', 'drops-container-clipper')
		.append('rect')
		.attr('id', 'drops-container-rect')
		.attr('width', width)
		.attr(
			'height',
			dimensions.height +
			configuration.margin.top +
			configuration.margin.bottom
		);

	const labelsContainer = svg
		.append('g')
		.classed('labels', true)
		.attr('width', configuration.labelsWidth)
		.attr('transform', `translate(0, ${configuration.lineHeight})`);

	const chartWrapper = svg
		.append('g')
		.attr('class', 'chart-wrapper')
		.attr('width', dimensions.width - width)
		.attr(
			'transform',
			`translate(${labelsWidth}, ${configuration.margin.top})`
		);

	const dropsContainer = chartWrapper
		.append('g')
		.classed('drops-container', true)
		.attr('clip-path', 'url(#drops-container-clipper)');

	const shapesContainer = chartWrapper
		.append('g')
		.classed('shapes-container', true)
		.attr('clip-path', 'url(#drops-container-clipper)');

	if (configuration.metaballs) {
		dropsContainer.style('filter', 'url(#metaballs)');
	}
	if (configuration.highlights) {
		highlights(defs);
	}

	chartWrapper
		.append('g')
		.classed('extremum', true)
		.attr('width', dimensions.width)
		.attr('height', 30)
		.attr('transform', `translate(0, -35)`);

	if (configuration.metaballs) {
		metaballs(defs);
	}

	const axesContainer = chartWrapper.append('g').classed('axes', true);
	const lineSeparator = lineSeparatorFactory(
		scales,
		configuration,
		dimensions
	);

	const labels = labelsFactory(labelsContainer, scales, configuration);

	const drops = dropsFactory(dropsContainer, scales, configuration);

	const shapes = shapesFactory(shapesContainer, scales, configuration);

	return data => {
		lineSeparator(axesContainer, data);
		delimiters(
			svg,
			scales,
			labelsWidth,
			configuration.dateFormat
		);
		drops(data);
		shapes(data);
		labels(data);
		if (boolOrReturnValue(configuration.hasTopAxis, data)) {
			drawTopAxis(axesContainer, scales.x, configuration, dimensions);
		}
		if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
			drawBottomAxis(axesContainer, scales.x, configuration, dimensions);
		}
	};
};
