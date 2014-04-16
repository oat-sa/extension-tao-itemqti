define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor'
], function ($, styleEditor) {
    'use strict'

    var fontSizeChanger = function () {
        var fontSizeChanger = $('#item-editor-font-size-changer'),
            target = fontSizeChanger.data('target'),
            headSelector = target + ' .item-title',
            bodySelector = target + ' .qti-itemBody',
            headFontSize = parseInt($(headSelector).css('font-size'), 10),
            bodyFontSize = parseInt($(bodySelector).css('font-size'), 10),
            resetButton =  fontSizeChanger.parents('.reset-group').find('[data-role="font-size-reset"]');

        fontSizeChanger.find('a').on('click', function(e) {
            e.preventDefault();
            if($(this).data('action') === 'reduce') {
                headFontSize--;
                bodyFontSize--;
            }
            else {
                headFontSize++;
                bodyFontSize++;
            }
            styleEditor.apply(headSelector, 'font-size', headFontSize.toString() + 'px');
            styleEditor.apply(bodySelector, 'font-size', bodyFontSize.toString() + 'px');
            $(this).parent().blur();
        });

        resetButton.on('click', function () {
            styleEditor.apply(headSelector, 'font-size');
            styleEditor.apply(bodySelector, 'font-size');
        });
    };

    return fontSizeChanger;
});

