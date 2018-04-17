export default (config, xScale) => selection => {
    const {
        margin,
        bound: { format: dateFormat },
        label: { width: labelWidth },
        line: { height: lineHeight },
    } = config;

    const bounds = selection.selectAll('.bound').data(d => d);
    const data = selection.data();
    let numberRows;
    if (data && data.length) {
    	 numberRows = selection.data()[0].length;
	}
	else {
    	return null
	}

    bounds.exit().remove();

    bounds
        .enter()
        .filter((_, i) => !i)
        .append('g')
        .classed('bound', true)
        .classed('start', true)
        .attr(
            'transform',
            `translate(${labelWidth}, ${lineHeight * numberRows + margin.top})`
        )
        .append('text')
        .text(dateFormat(xScale.domain()[0]));

    bounds
        .enter()
        .filter((_, i) => !i)
        .append('g')
        .classed('bound', true)
        .classed('end', true)
        .attr(
            'transform',
            `translate(${labelWidth}, ${lineHeight * numberRows + margin.top})`
        )
        .append('text')
        .attr('x', xScale.range()[1] - margin.right)
        .attr('text-anchor', 'end')
        .text(dateFormat(xScale.domain()[1]));

    bounds.selectAll('.bound.start text').text(dateFormat(xScale.domain()[0]));
    bounds.selectAll('.bound.end text').text(dateFormat(xScale.domain()[1]));
};
