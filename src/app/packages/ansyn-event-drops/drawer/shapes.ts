import { symbol, symbolStar } from 'd3';

export default (container, scales, configuration) =>
	data => {
		/*const leftOffset = configuration.labelsWidth +
			configuration.labelsRightMargin;*/

		const shapeLines = container
			.selectAll('.shape-line')
			.data(data)
			.enter()
			.append('g')
			.classed('shape-line', true)
			.attr('width', scales.x.range()[1])
			.attr('transform', (d, idx) => `translate(0, ${scales.y(idx)})`);

		const shapes = shapeLines.selectAll('.shape');
		shapes
			.data(d => d.data)
			.enter()
			.filter(d => {
				if (d.shape) {
					return d;
				}
				return false;
			})
			.append('path')
			.attr('d', symbol().size(140).type(symbolStar))
			.attr('fill', d => configuration.shapes[d.shape].fill)
			.classed('shape', true)
			.attr('stroke', 'white')
			.attr('stroke-width', 1)
			.attr('data-id', d => d.id)
			.attr('transform', (d, idx) => `translate(${scales.x(configuration.date(d))},${configuration.shapes[d.shape].offsetY})`)
			.on('mousedown', configuration.click)
			.on('dblclick', configuration.dblclick)
			.on('mouseover', configuration.mouseover)
			.on('mouseout', configuration.mouseout);

		shapes
			.exit()
			.on('mousedown', null)
			.on('dblclick', null)
			.on('mouseout', null)
			.on('mouseover', null)
			.remove();

		shapeLines.exit().remove();
		// unregister previous event handlers to prevent from memory leaks

	};
