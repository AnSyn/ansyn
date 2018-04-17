import { uniqBy } from 'lodash';

const filterOverlappingDrop = (xScale, dropDate) => d =>
	uniqBy(d.data, data => Math.round(xScale(dropDate(data))));

// const noFilterOverlap = (line) => {
//
// }
export default (config, xScale) => selection => {
	const {
		drop: {
			color: dropColor,
			radius: dropRadius,
			date: dropDate,
			onClick,
			onMouseOver,
			onMouseOut,
			onDblClick,
			dropId
		},
	} = config;

	const drops = selection
		.selectAll('.drop')
		.data(line => line.data);
	// .data(filterOverlappingDrop(xScale, dropDate));

	drops
		.enter()
		.append('circle')
		.classed('drop', true)
		.attr('r', dropRadius)
		.attr('fill', dropColor)
		.on('click', onClick)
		.on('mouseover', onMouseOver)
		.on('mouseout', onMouseOut)
		.on('dblclick', onDblClick)
		.merge(drops)
		.attr('id', dropId)
		.attr('cx', d => xScale(dropDate(d)));

	drops
		.exit()
		.on('click', null)
		.on('mouseover', null)
		.on('mouseout', null)
		.remove();




};

