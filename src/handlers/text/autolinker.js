import Autolinker from 'autolinker';
import layerUI from '../../base';

const autolinker = new Autolinker({
  truncate: {
    length: 40,
    location: 'middle',
  },
  className: 'layer-parsed-url',
});
/**
 * The Layer Image TextHandler replaces all image URLs with image tags
 *
 * @class layerUI.handlers.text.Autolinker
 */
layerUI.registerTextHandler({
  name: 'autolinker',
  order: 400,
  requiresEnable: true,
  handler(textData) {
    textData.text = autolinker.link(textData.text);
  },
});
