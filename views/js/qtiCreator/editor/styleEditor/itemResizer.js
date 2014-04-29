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
                    min: Math.min(768,targetWidth),
                    max: Math.max(1200,targetWidth)
                },
                start: targetWidth
            },
            isResponsive = true,
            style = styleEditor.getStyle(),
            currentItem = styleEditor.getItem();


        /**
         * is the item width dynamic or fixed?
         */
        var setResponsiveness = function(value) {
            isResponsive = value;
            $target.trigger('modechange.itemresizer', [isResponsive]);
        };

        setResponsiveness(!!(style[target] && style[target].width));

        currentItem.data('responsive', isResponsive);


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
            setResponsiveness(false);
            styleEditor.apply(target, 'width', val);
        };

        /**
         * Initialize radio buttons
         */
        itemResizer.find('[name="item-width-prompt"]').on('click', function() {
            // user intends to resize the item
            if(this.value === 'slider') {
                resizeItem($target.width());
                sliderBox.slideDown();
            }
            // user wants to use default
            else {
                slider.val(sliderSettings.start);
                sliderBox.slideUp();
                input.val('');

                setResponsiveness(true);

                styleEditor.apply(target, 'width');
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
        $(document).on('cssloaded.styleeditor', reset);
    };
    return itemResizer;
});