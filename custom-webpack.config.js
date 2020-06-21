/* This file was added in order to overcome a bug with Cesium and webpack (CesiumGS/cesium#8673) - it enables custom webpack config. */
// TODO - file should be removed in Cesium future versions.
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
