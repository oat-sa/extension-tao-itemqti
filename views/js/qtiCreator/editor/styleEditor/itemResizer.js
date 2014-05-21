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
            $target = $(target),
            targetWidth = $target.width(),
            sliderBox = itemResizer.find('.slider-box'),
            slider = itemResizer.find('#item-editor-item-resizer-slider'),
            input = $('#item-editor-item-resizer-text'),
            resetButton =  itemResizer.find('[data-role="item-width-reset"]'),
            sliderSettings = {
                range : {
                    min: Math.min(768, targetWidth),
                    max: Math.max(1200, targetWidth)
                },
                start: targetWidth
            };


        var reset = function() {
            itemResizer.find('[value="no-slider"]').trigger('click');
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
            styleEditor.apply(target, 'max-width', 'none');
        };

        /**
         * Initialize radio buttons
         */
        itemResizer.find('[name="item-width-prompt"]').on('click', function() {
            // user intends to resize the item
            if(this.value === 'slider') {
                resizeItem($target.width());
                input.val($target.width());
                sliderBox.slideDown();
                slider.val($target.width()).trigger('slide');
            }
            // user wants to use default
            else {
                slider.val(sliderSettings.start);
                sliderBox.slideUp();
                input.val('');

                styleEditor.apply(target, 'width');
                styleEditor.apply(target, 'max-width');
            }
        });


        slider.noUiSlider(sliderSettings);
        slider.on('slide', function() {
            var value = Math.round(slider.val());
            input.val(value);
            resizeItem(value);
        });

        input.on('keydown', function(e) {
            var c = e.keyCode;
            return (_.contains([8, 37, 39, 46], c)
                || (c >= 48 && c <= 57)
                || (c >= 96 && c <= 105));
        });

        input.on('blur', function() {
            resizeItem(this.value);
        });

        resetButton.on('click', reset);
        $(document).on('customcssloaded.styleeditor', function(e, style) {
            
            //@todo : to be fixed ! currently disabled because keep triggering error "style is undefined"
            return;
            
            var width;
            if(style[target] && style[target].width) {
                width = parseInt(style[target].width, 10);
                input.val(width);
                slider.val(width);
                itemResizer.find('[value="slider"]').trigger('click');
            }
        });
    };
    return itemResizer;
});
