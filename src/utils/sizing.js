
// NOTE: dimensions must contains width and height properties.
module.exports = (dimensions, maxSizes) => {

  if (!dimensions) return maxSizes;

  const size = {
    width: dimensions.previewWidth || dimensions.width,
    height: dimensions.previewHeight || dimensions.height,
  };

  // Scale dimensions down to our maximum sizes if needed
  if (size.width > maxSizes.width) {
    const width = size.width;
    size.width = maxSizes.width;
    size.height = size.height * maxSizes.width / width;
  }
  if (size.height > maxSizes.height) {
    const height = size.height;
    size.height = maxSizes.height;
    size.width = size.width * maxSizes.height / height;
  }

  // Return scaled sizes
  return {
    width: Math.round(size.width),
    height: Math.round(size.height),
  };
};
