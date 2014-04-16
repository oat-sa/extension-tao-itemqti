define([
    'jquery',
    'nouislider',
    'jqueryui'

], function ($) {
    'use strict'


    /**
     * Adapt the image editor to the target screen the students will be using
     */
    var itemResizer = function () {

        var itemResizer = $('#item-editor-item-resizer'),
            target = itemResizer.data('target'),
            sliderBox = itemResizer.find('.slider-box'),
            slider = itemResizer.find('#item-editor-item-resizer-slider'),
            sliderSettings = {
                range : {
                    min: 768,
                    max: 1200
                },
                start: $(target).width()
            };

        itemResizer.find('[name="item-width-prompt"]').on('click', function() {
            if(this.value === 'slider') {
                sliderBox.slideDown();
            }
            else {
                sliderBox.slideUp();
            }
        });

        console.log(target, $(target))

        slider.noUiSlider(sliderSettings);
        return
//
//        var updateFirst = function () {
//                var text = deviceSelector[0].selectedIndex !== 0 ? deviceSelector.data('selected') : deviceSelector.data('not-selected');
//                deviceSelector.find('option').first().text(text);
//            },
//            sliderParams = {
//                min: base.setup.get('minWidth'),
//                max: base.setup.get('maxWidth'),
//                value: base.setup.get('width'),
//                slide: function (event, ui) {
//                    adaptWidth(ui.value);
//                },
//                start: function (event, ui) {
//                    adaptWidth(ui.value);
//                    widthIndicator.show();
//                },
//                stop: function () {
//                    widthIndicator.fadeOut('slow');
//                },
//                change: function (event, ui) {
//                    base.setup.set('width', ui.value);
//                }
//            };
//
//
//        adaptWidth(base.setup.get('width'));
//        sliderWidget.slider(sliderParams);
//
//        deviceSelector.append(deviceOptions).on('change', function () {
//            var width = $(this).val();
//            updateFirst();
//            adaptWidth(width);
//            widthIndicator.show();
//            sliderWidget.slider('value', width);
//            window.setTimeout(function () {
//                widthIndicator.fadeOut('slow');
//            }, 2000)
//        });
//
//
//        updateFirst();
//        deviceSelector.select2({ width: '100%' });
    };
    return itemResizer;
});