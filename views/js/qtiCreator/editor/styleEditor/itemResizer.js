define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'nouislider',
    'jqueryui'

], function ($, styleEditor) {
    'use strict'


    /**
     * Adapt the image editor to the target screen the students will be using
     */
    var itemResizer = function () {

        var itemResizer = $('#item-editor-item-resizer'),
            target = itemResizer.data('target'),
            sliderBox = itemResizer.find('.slider-box'),
            slider = itemResizer.find('#item-editor-item-resizer-slider'),
            input = $('#item-editor-item-resizer-text'),
            resetButton =  itemResizer.find('[data-role="item-width-reset"]'),
            sliderSettings = {
                range : {
                    min: 768,
                    max: 1200
                },
                start: 0
            };


        /**
         * Resize item
         *
         * @param val int|string
         */
        var resizeItem = function(val) {
            // to make sure the value can come as int or string
            val = parseInt(val).toString() + 'px';
            styleEditor.apply(target, 'width', val);
        };

        var reset = function() {
            slider.val(sliderSettings.range.min);
            styleEditor.apply(target, 'width');
            input.val('');
        };

        itemResizer.find('[name="item-width-prompt"]').on('click', function() {
            if(this.value === 'slider') {
                sliderBox.slideDown();
            }
            else {
                sliderBox.slideUp();
            }
        });


        slider.noUiSlider(sliderSettings);
        slider.on('slide', function() {
            var value = Math.round(slider.val());
            input.val(value.toString() + 'px');
            resizeItem(value);
        });

        input.on('blur', function() {
            resizeItem(this.value);
            this.value = parseInt(this.value).toString() + 'px';
        });

        resetButton.on('click', reset);
    };
    return itemResizer;
});