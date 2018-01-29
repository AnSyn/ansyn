// import * as d3 from 'd3/build/d3';
import configurable from './configurable/configurable';
import { scaleOrdinal, scaleTime, select } from 'd3';
import './style.css';
import defaultConfig from './config';
import drawer from './drawer/index';
import zoom from './zoom';


const eventDrops = function (config = {}) {
	const finalConfiguration = Object.assign({}, defaultConfig, config, { leftWidth: null });

	const yScale = data => {
		const handler = scaleOrdinal()
			.domain(data.map(d => d.name))
			.range(data.map((d, i) => i * finalConfiguration.lineHeight));
		return handler;
	};

	const xScale = (width, timeBounds) => {
		return scaleTime().domain(timeBounds).range([0, width]);
	};

	function eventDropGraph(selection) {
		return selection.each(function selector(data) {
			finalConfiguration.leftWidth = finalConfiguration.displayLabels
				? finalConfiguration.labelsWidth +
				finalConfiguration.labelsRightMargin
				: 0;
			select(this).select('.event-drops-chart').remove();

			const dimensions = {
				width: this.clientWidth,
				height: data.length * finalConfiguration.lineHeight
			};

			const svg = select(this)
				.append('svg')
				.classed('event-drops-chart', true)
				.attr(
					'width',
					dimensions.width +
					(finalConfiguration.margin.left +
						finalConfiguration.margin.right)
				)
				.attr(
					'height',
					dimensions.height +
					finalConfiguration.margin.top +
					finalConfiguration.margin.bottom
				);

			const scales = getScales(dimensions, finalConfiguration, data);

			const draw = drawer(svg, dimensions, scales, finalConfiguration);
			draw(data);

			if (finalConfiguration.zoomable) {
				zoom(
					svg,
					dimensions,
					scales,
					finalConfiguration,
					data,
					finalConfiguration.zoomStreamCallback
				);
			}
		});
	}

	function getScales(dimensions, configuration, data) {
		return {
			x: xScale(dimensions.width - finalConfiguration.leftWidth, [
				configuration.start,
				configuration.end
			]),
			y: yScale(data)
		};
	}

	configurable(eventDropGraph, finalConfiguration);

	return eventDropGraph;
};

export { eventDrops };
