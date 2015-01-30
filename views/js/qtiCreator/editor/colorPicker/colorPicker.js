define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/helper/popup',
    'tpl!taoQtiItem/qtiCreator/editor/colorPicker/tpl/popup',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function ($, _, popup, popupTpl) {

    var _defaults = {};

    // based on http://stackoverflow.com/a/14238466
    // this conversion is required to communicate with farbtastic
    function rgbToHex(color) {

        function toHexPair(inp) {
            return ('0' + parseInt(inp, 10).toString(16)).slice(-2);
        }

        // undefined can happen when no color is defined for a particular element
        // isString on top of that should cover all sorts of weird input
        if(!_.isString(color) || color.indexOf('rgb') !== 0) {
            return color;
        }

        var rgbArr = /rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i.exec(color);

        // color is not rgb
        if(!_.isArray(rgbArr) || rgbArr.length !== 4) {
            return color;
        }

        return '#' + toHexPair(rgbArr[1]) + toHexPair(rgbArr[2]) + toHexPair(rgbArr[3]);
    }


    function changeColor(color, $colorTrigger) {
        var hex = rgbToHex(color);
        $colorTrigger.prop('hexval').val(hex);
        $colorTrigger.css('background-color', color);
        $colorTrigger.trigger('colorchange.colorpicker', { color: color, hex: hex });
    }

    function create($colorTrigger, config) {

        var color,
            $itemContainer = $('#item-editor-wrapper'),
            $popup = $(popupTpl());

        config = _.defaults(config || {}, _defaults);

        // input field holding the initial value
        $colorTrigger.prop('hexval', $colorTrigger.siblings('input'));

        // initial color
        color = config.color || $colorTrigger.prop('hexval').val() || '#ffffff';

        //set color recorded in the hidden input to the color trigger
        changeColor(color, $colorTrigger);

        $itemContainer.append($popup);

        // basic popup functionality
        popup.init($colorTrigger, { popup: $popup });


        // after popup opens
        $colorTrigger.on('open.popup', function (e, params) {

            var $trigger = $(this),
                $content = $trigger.parents('.sidebar-popup-content'),
            // this is the input above the trigger, _not_ the one of the color picker
                $titleField = $content.find('[data-role="title"]'),
                color = $trigger.prop('hexval').val(),
                $colorPicker = params.popup.find('.color-picker'),
                $colorPickerInput = params.popup.find('.color-picker-input'),
                $container = $(this).parents('.sidebar-popup');

            params.popup.css({
                right: $(window).width() - $container.offset().left + 2,
                top: $titleField.offset().top - $itemContainer.offset().top
            });
            params.popup.find('h3').text($titleField.val());

            // Init the color picker
            $colorPicker.farbtastic($colorPickerInput);

            // Set the color to the currently set on the form init
            $colorPickerInput.val(color).trigger('keyup');
            config.color = color;

            // Populate the input with the color on quitting the modal
            params.popup.find('.closer').off('click').on('click', function () {
                params.popup.hide();
                $colorPicker.off('.farbtastic');
            });

            //listen to color change
            $colorPicker.off('.farbtastic').on('colorchange.farbtastic', function (e, color) {
                changeColor(color, $colorTrigger);
            });

        });

        // after popup closes
        $colorTrigger.on('close.popup', function (e, params) {
            params.popup.find('.color-picker').off('.farbtastic');
        });

    }

    function destroy($trigger) {
        $trigger.off('.color-picker');
        $trigger.removeAttr('data-color-picker');
    }

    return {
        create: create,
        destroy: destroy
    };
});