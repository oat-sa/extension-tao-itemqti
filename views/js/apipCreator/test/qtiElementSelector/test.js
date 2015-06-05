require([
    'jquery',
    'lodash',
    'taoQtiItem/apipCreator/editor/qtiElementSelector',
    'taoQtiItem/apipCreator/api/apipItem', 
    'text!taoQtiItem/apipCreator/test/assets/apip_example_exemplar01.xml'
], function ($, _, qtiElementSelector, ApipItem, sampleXML){

    'use strict';

    QUnit.test('render view', function (){

        QUnit.expect(0);
        
        var $selectorContainer = $('#apip-creator-scope');
        var apipItem = new ApipItem(sampleXML);
        qtiElementSelector.render($selectorContainer, apipItem.getItemBodyModel());

    });

});