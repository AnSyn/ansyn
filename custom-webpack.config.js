module.exports = {
	node: {
		// Resolve node module use of fs
		fs: "empty",
		Buffer: false,
		http: "empty",
		https: "empty",
		zlib: "empty"
	}
};
