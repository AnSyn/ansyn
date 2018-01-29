import { event as d3Event } from 'd3';

export default (container, scales, configuration) =>
	data => {
		const leftOffset = configuration.labelsWidth +
			configuration.labelsRightMargin;

		const dropLines = container
			.selectAll('.drop-line')
			.data(data)
			.enter()
			.append('g')
			.classed('drop-line', true)
			.attr('width', scales.x.range()[1])
			.attr('transform', (d, idx) => `translate(0, ${scales.y(idx)})`)
			.attr('fill', configuration.eventLineColor);

		const drops = dropLines.selectAll('.drop');

		drops
			.data(d => d.data)
			.enter()
			.filter(d => {
				if (!d.shape) {
					return d;
				}
				return false;
			})
			.append('circle')
			.classed('drop', true)
			.attr('r', 5)
			.attr('cx', d => scales.x(configuration.date(d)))
			.attr('cy', configuration.lineHeight / 2)
			.attr('fill', configuration.eventColor)
			.attr('data-id', d => d.id)
			.on('mousedown', (data, index, node) => configuration.click(data, index, node, d3Event))
			.on('dblclick', (data, index, node) => configuration.dblclick(data, index, node, d3Event))
			.on('mouseover', (data, index, node) => configuration.mouseover(data, index, node, d3Event))
			.on('mouseout', (data, index, node) => configuration.mouseout(data, index, node, d3Event));

		// unregister previous event handlers to prevent from memory leaks
		drops
			.exit()
			.on('mousedown', null)
			.on('dblclick', null)
			.on('mouseout', null)
			.on('mouseover', null)
			.remove();

		dropLines.exit().remove();
	};
