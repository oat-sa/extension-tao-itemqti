define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function ($, styleEditor) {
    'use strict'

    // based on http://stackoverflow.com/a/14238466
    // this conversion is required to communicate with farbtastic
    function rgbToHex(color) {
        if(0 !== color.indexOf('rgb')) {
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
            widget = colorPicker.find('.color-picker'),
            widgetBox = colorPicker.find('#color-picker-container'),
            titleElement =  colorPicker.find('#color-picker-title'),
            input = colorPicker.find('#color-picker-input'),
            resetButtons = colorPicker.find('.reset-button'),
            colorTriggers = colorPicker.find('.color-trigger'),
            currentProperty = 'color',
            widgetObj,
            $doc = $(document);


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
        resetButtons.on('click', function () {
            var $this = $(this),
                $colorTrigger = $this.parent().find('.color-trigger'),
                target = $colorTrigger.data('target'),
                value = $colorTrigger.data('value');
            styleEditor.apply(target, value);
            setTriggerColor();
        });


        $doc.on('customcssloaded.styleeditor', setTriggerColor);
    };

    return colorSelector;
});

/*
 .tao-scope div.qti-item{width:933px;font-family:Calibri,Candara,Segoe,'Segoe UI',Optima,Arial,sans-serif;}
 .tao-scope div.qti-item .item-title{font-size:24px;}
 .tao-scope div.qti-item .qti-itemBody{font-size:14px;}
 .tao-scope div.qti-item .solid{border-color:#33d863;}

 .tao-scope div.qti-item background-color colorSelector.js:109
 .tao-scope div.qti-item .solid border-color

 */