require([
    'jquery',
    'lodash',
    'taoQtiItem/apipCreator/editor/selector'
],
    function($, _, selector){
        
        'use strict';
            
        QUnit.test('render view', function(){
            
            QUnit.expect(0);
            
            var $itemBody = $($('#qti-sample').html());
            console.log($itemBody);
            var rendering = selector.renderSelectorView($itemBody[0]);
            var $selectorContainer = $('#apip-creator-scope .apip-selector-view');
            $selectorContainer.append(rendering);
        });
    });