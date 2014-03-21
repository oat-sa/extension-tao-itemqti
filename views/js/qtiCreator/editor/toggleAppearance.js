define([
  'jquery',
  'jquerytools',
  'taoQtiItemCreator/editor/base'
], function($, jquerytools, base){
  'use strict'

  /**
   * Preview the item.
   *
   * This uses jQuery toolbox expose() to cover the editor part
   * and highlight the item only without any tools, grid guides and such
   *
   * @todo hasActiveWidget should dis/enable button
   * @todo there might be tools such as ck editor active, they need to be hidden too
   * @author <a href="mailto:dieter@taotesting.com">Dieter Raber</a>
   */
  var toggleAppearance = function() {
    var trigger = $('#appearance-trigger'),
      label = trigger.find('.menu-label'),
      itemLabel = trigger.data('item'),
      widgetLabel = trigger.data('widget'),
      hasActiveWidget = !!base.widgetBar.find('.active-widget').length;

    trigger.on('click', function() {
      if(base.widgetBar.is(':visible')) {
        base.widgetBar.hide();
        base.itemBar.slideDown();
        label.text(widgetLabel);
      }
      else {
        base.itemBar.hide();
        base.widgetBar.slideDown();
        label.text(itemLabel);
      }
    });

  }
  return toggleAppearance;
});


