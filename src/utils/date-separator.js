/**
 * Use this module to put a date separator between Messages from different dates in your Messages List.
 *
 * ```
 * conversationPanel.onRenderListItem = layerUI.utils.dateSeparator;
 * ```
 *
 * Or if you have multiple `onRenderListItem` handlers:
 *
 * ```
 * conversationPanel.onRenderListItem = function(widget, messages, index, isTopItem) {
 *     layerUI.utils.dateSeparator(widget, messages, index);
 *     handler2(widget, messages, index, isTopItem);
 *     handler3(widget, messages, index, isTopItem);
 * }
 * ```
 *
 * Date separators come as `<div class='layer-list-item-separator-date'><span>DATE</span></div>`
 *
 * @class layerUI.utils.DateSeparator
 */
import LayerUI, { utils } from '../base';

const dateClassName = 'layer-list-item-separator-date';

module.exports = utils.dateSeparator = (widget, messages, index) => {
  const message = widget.item;
  const needsBoundary = index === 0 || message.sentAt.toDateString() !== messages[index - 1].sentAt.toDateString();

  if (needsBoundary) {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' };
    const dateStr = messages[index].sentAt.toLocaleDateString(undefined, options);
    LayerUI.addListItemSeparator(widget, `<span>${dateStr}</span>`, dateClassName, true);
  } else {
    LayerUI.addListItemSeparator(widget, '', dateClassName, true);
  }
};

