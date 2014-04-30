define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function ($, styleEditor) {
    'use strict'

    // based on http://stackoverflow.com/a/14238466
    // this conversion is required to communicate with farbtastic
    function rgbToHex(color) {
        if (color.substr(0, 1) === "#") {
            return color;
        }
        var rgbArr = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
            red   = ('0' + parseInt(rgbArr[2], 10).toString(16)).slice(-2),
            green = ('0' + parseInt(rgbArr[3], 10).toString(16)).slice(-2),
            blue  = ('0' + parseInt(rgbArr[4], 10).toString(16)).slice(-2);
        return '#' + red + green + blue;
    }

    var colorSelector = function () {
        var colorPicker = $('#item-editor-color-picker'),
            target = colorPicker.data('target'),
            widget = colorPicker.find('.color-picker'),
            widgetBox = colorPicker.find('#color-picker-container'),
            titleElement =  colorPicker.find('#color-picker-title'),
            input = colorPicker.find('#color-picker-input'),
            resetButtons = colorPicker.find('.reset-button'),
            colorTriggers = colorPicker.find('.color-trigger'),
            currentProperty = 'color',
            widgetObj,
            $doc = $(document);

        var reset = function() {

//            colorTriggers.each(function() {
//                var $trigger = $(this),
//                    target = $trigger.data('target'),
//                    value = $trigger.data('value');
//                console.log(target, value)
//                styleEditor.apply(target, $(this).data('value'));
//
//            });
            styleEditor.apply(target, $(this).data('value'));
            setTriggerColor();
        };


        /**
         * Widget title
         *
         * @param property
         * @param trigger
         */
        var setTitle = function (property, trigger) {
            titleElement.text(trigger.parent().find('label').text());
        };

        /**
         * Trigger button background
         */
        var setTriggerColor = function() {
            colorTriggers.each(function () {
                var $trigger = $(this),
                    $target = $($trigger.data('target'));
                $trigger.css('background-color', $target.css($trigger.data('value')));
            });
        };

        widgetObj = $.farbtastic(widget).linkTo(input);

        // event received from modified farbtastic
        widget.on('colorchange.farbtastic', function (e, color) {
            styleEditor.apply(widget.prop('target'), currentProperty, color);
            setTriggerColor();
        });


        // open color picker
        setTriggerColor();
        colorTriggers.on('click', function () {
            var $trigger = $(this);

            if(!$($trigger.data('target')).length) {
                return;
            }
            widget.prop('target', $trigger.data('target'));
            widgetBox.hide();
            currentProperty = $trigger.data('value');
            setTitle(currentProperty, $trigger);
            widgetObj.setColor(rgbToHex($trigger.css('background-color')));
            widgetBox.show();
        });

        // close color picker, when clicking somewhere outside or on the x
        $doc.on('mouseup', function(e) {
            if(e.target.className.indexOf('closer') > -1) {
                widgetBox.hide();
                return false;
            }

            if (!widgetBox.is(e.target)
                && widgetBox.has(e.target).length === 0) {
                widgetBox.hide();
                return false;
            }
        });

        // close color picker on escape
        $doc.on('keyup', function(e){
            if (e.keyCode === 27) {
                widgetBox.hide();
                return false;
            }
        });


        // reset to default
        resetButtons.on('click', reset);


        $doc.on('customcssloaded.styleeditor', reset);
    };

    return colorSelector;
});