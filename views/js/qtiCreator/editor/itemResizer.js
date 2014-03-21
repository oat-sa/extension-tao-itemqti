define([
  'jquery',
  'jqueryui',
  'taoQtiItemCreator/editor/base',
  'json!taoQtiItemCreator/editor/resources/device-list.json',
  'select2'
], function($, jqueryui, base, deviceList){
  'use strict'

  var orientations = {
    width: 'Landscape',
    height: 'Portrait'
  },
  orientation,
  px;
  
  var deviceListToDeviceListByDimension = function(deviceList){

    var deviceListByDimension = {},
      deviceType, 
      device,
      currentDevice,
      px,
      label;

    // device type here is 'tablets', 'phones' etc.
    for(deviceType in deviceList){
      for(device in deviceList[deviceType]) {
        currentDevice = deviceList[deviceType][device];
        for(orientation in orientations){
          // px is either width or height in pixels
          px = Math.round(currentDevice[orientation] / currentDevice.scaleFactor);
          label = currentDevice.label.substring(currentDevice.label.indexOf(' ') + 1)
            + ' (' + (orientations[orientation]);
          if(currentDevice.scaleFactor > 1) {
            label += ' × ' + currentDevice.scaleFactor;
          }
          label += ')';
          if(!deviceListByDimension[px]) {
            deviceListByDimension[px] = [];
          }
          deviceListByDimension[px].push(label);
        }
      }
    }

    for(px in deviceListByDimension) {
      deviceListByDimension[px] = deviceListByDimension[px].join(', ');
    }

    return deviceListByDimension;
  };

  var buildDeviceOptions = function(deviceList){

    var options = $(),
      currentWidth = base.setup.get('width'),
      deviceType,
      device,
      currentDevice,
      option,
      px;

    // device type here is 'tablets', 'phones' etc.
    for(deviceType in deviceList){
      for(device in deviceList[deviceType]) {
        currentDevice = deviceList[deviceType][device];
        for(orientation in orientations){
          // px is either width or height in pixels
          px = Math.round(currentDevice[orientation] / currentDevice.scaleFactor);
          option = $('<option>', {
            value: px,
            text: currentDevice.label + ' (' + orientations[orientation] + ')'
          });
          //@todo : selected option if()
          options = options.add('<option>', {
            value: px,
            text: currentDevice.label + ' (' + orientations[orientation] + ')'
          });

        }
      }
    }

    return options;
  }


  /**
   * Adapt the image editor to the target screen the students will be using
  */
  var itemResizer = function() {
    
    // use only tablets for now
    delete(deviceList.phones);
    
    var deviceListByDimension = deviceListToDeviceListByDimension(deviceList),

      deviceOptions = buildDeviceOptions(deviceList),
      deviceSelector = $('#item-editor-device-selector'),

      widthIndicator = $('#item-width-indicator-box'),
      widthDevices   = $('#item-width-devices'),
      widthPx        = $('#item-width-px'),
      sliderWidget   = $('#item-editor-resizer'),
      adaptWidth     = function(width) {
        if(width) {
          width = parseInt(width, 10);
          base.item.width(width);
          widthPx.text(width.toString() + 'px');
        }
        else {
          base.item.removeAttr('style');
          widthPx.text('100%');
        }
//        widthIndicator.width(base.item.width() -10);
//        if(deviceListByDimension[width]) {
//          widthDevices.css({opacity: 1});
//          widthDevices.text(deviceListByDimension[width]);
//        }
//        else {
//          widthDevices.stop().animate({opacity: 0})
//        }
      },
      updateFirst = function() {
        var text = deviceSelector[0].selectedIndex !== 0 ? deviceSelector.data('selected') : deviceSelector.data('not-selected');
        deviceSelector.find('option').first().text(text);
      },
      sliderParams = {
        min: base.setup.get('minWidth'),
        max: base.setup.get('maxWidth'),
        value: base.setup.get('width'),
        slide: function(event, ui){
          adaptWidth(ui.value);
        },
        start: function(event, ui) {
          adaptWidth(ui.value);
          widthIndicator.show();
        },
        stop: function() {
          widthIndicator.fadeOut('slow');
        },
        change: function(event, ui) {
          base.setup.set('width', ui.value);
        }
      };


    adaptWidth(base.setup.get('width'));
    sliderWidget.slider(sliderParams);

    deviceSelector.append(deviceOptions).on('change', function() {
      var width = $(this).val();
      updateFirst();
      adaptWidth(width);
      widthIndicator.show();
      sliderWidget.slider('value', width);
      window.setTimeout(function() {
        widthIndicator.fadeOut('slow');
      }, 2000)
    });


    updateFirst();
    deviceSelector.select2({ width: '100%' });
  };
  return itemResizer;
});