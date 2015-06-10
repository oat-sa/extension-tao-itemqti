require([
    'jquery',
    'lodash',
    'taoQtiItem/apipCreator/editor/qtiElementSelector',
    'taoQtiItem/apipCreator/api/apipItem', 
    'text!taoQtiItem/apipCreator/test/assets/apip_example_exemplar01.xml'
], function ($, _, qtiElementSelector, ApipItem, sampleXML){
    
    console.log({sampleXML:sampleXML});
    
    'use strict';

//    QUnit.test('render view', function (){
//
//        QUnit.expect(0);
//        
//        var $selectorContainer = $('#apip-creator-scope').off().empty();
//        var apipItem = new ApipItem(sampleXML);
//        qtiElementSelector.render($selectorContainer, apipItem.getItemBodyModel());
//
//    });
    
    QUnit.test('setApipFeatures', function (){
        
        QUnit.expect(0);
        
        var $selectorContainer = $('#apip-creator-scope').off().empty();
        var apipItem = new ApipItem(sampleXML);
        qtiElementSelector.render($selectorContainer, apipItem.getItemBodyModel());
        qtiElementSelector.setApipFeatures($selectorContainer, apipItem, 'aslDefaultOrder');
    });

});