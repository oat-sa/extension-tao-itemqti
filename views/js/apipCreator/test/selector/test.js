require([
    'jquery',
    'lodash',
    'taoQtiItem/apipCreator/editor/selector'
],
    function($, _, selector){
        
        'use strict';
            
        QUnit.test('render view', function(){
            
            QUnit.expect(0);
            
            var $selectorContainer = $('#apip-creator-scope .apip-selector-view');
            var $itemBody = $($('#qti-sample').html());
            var rendering = selector.renderSelectorView($itemBody[0]);
            
            $selectorContainer.append(rendering);
        });
        
        QUnit.test('selectable', function(){
            
            QUnit.expect(0);
            
            var $selectorContainer = $('#apip-creator-scope .apip-selector-view');
            selector.selectable($selectorContainer);
            
        });
    });