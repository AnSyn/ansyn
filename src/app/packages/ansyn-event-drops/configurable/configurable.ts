const configurable = function (targetFunction, config) {

	function configure(item) {
		return function (value) {
			if (!arguments.length) {
				return config[item];
			}
			else {
				config[item] = value;
				return targetFunction;
			}
		};
	}

	Object.keys(config).forEach(key => {
		targetFunction[key] = configure(key);
	});

	return targetFunction;
};

export default configurable;
