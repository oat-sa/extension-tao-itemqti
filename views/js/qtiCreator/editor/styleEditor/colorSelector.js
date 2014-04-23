define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function ($, styleEditor) {
    'use strict'

    // as found on http://stackoverflow.com/a/14238466
    // this conversion is required to communicate with farbtastic
    function rgbToHex(color) {
        if (color.substr(0, 1) === "#") {
            return color;
        }
        var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
            r = parseInt(nums[2], 10).toString(16),
            g = parseInt(nums[3], 10).toString(16),
            b = parseInt(nums[4], 10).toString(16);
        return "#" + (
            (r.length == 1 ? "0" + r : r) +
                (g.length == 1 ? "0" + g : g) +
                (b.length == 1 ? "0" + b : b)
            );
    }

    var colorSelector = function () {
        var colorPicker = $('#item-editor-color-picker'),
            target = colorPicker.data('target'),
            $target = $(target),
            widget = colorPicker.find('.color-picker'),
            widgetBox = colorPicker.find('#color-picker-container'),
            titles = {
                'background-color': widgetBox.find('h3.background-color'),
                'color': widgetBox.find('h3.color')
            },
            input = colorPicker.find('#color-picker-input'),
            resetButtons = colorPicker.find('.reset-button'),
            colorTriggers = colorPicker.find('.color-trigger'),
            currentProperty = 'color',
            currentColor,
            widgetObj;

        var setTitle = function (property) {
            var title;
            for (title in titles) {
                if (titles[title].hasClass(property)) {
                    titles[title].show();
                } else {
                    titles[title].hide();
                }
            }
        };

        widgetObj = $.farbtastic(widget).linkTo(input);

        widget.on('colorchange.farbtastic', function (e, color) {
            styleEditor.apply(target, currentProperty, color);
        });

        colorTriggers.each(function () {
            var $trigger = $(this);
            $trigger.css('background-color', $target.css($trigger.data('value')))
                .on('click', function () {
                    widgetBox.hide();
                    currentProperty = $trigger.data('value');
                    setTitle(currentProperty);
                    widgetObj.setColor(rgbToHex($trigger.css('background-color')));
                    widgetBox.show();
                });
        });


        $(document).mouseup(function (e) {
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

        resetButtons.on('click', function () {
            styleEditor.apply(target, $(this).data('value'));
        });
    };

    return colorSelector;
});