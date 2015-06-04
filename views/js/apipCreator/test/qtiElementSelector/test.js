require([
    'jquery',
    'lodash',
    'taoQtiItem/apipCreator/editor/qtiElementSelector'
], function ($, _, qtiElementSelector){

    'use strict';

    QUnit.test('render view', function (){

        QUnit.expect(0);

        var $selectorContainer = $('#apip-creator-scope');
        var $itemBody = $($('#qti-sample').html());
        qtiElementSelector.render($selectorContainer, $itemBody[0]);

    });

});