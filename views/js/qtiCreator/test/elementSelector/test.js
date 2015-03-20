require([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/editor/elementSelector/selector',
    'json!taoQtiItem/qtiCreator/test/elementSelector/interactions'
], function(_, $, selector, interactions){

    QUnit.test('init dialog', function(){

        QUnit.expect(5);

        var $container = $('#item-editor-panel');
        selector.init({
            attachTo : $('#center1'),
            container : $container,
            interactions : interactions
        });
        selector.init({
            attachTo : $('#center2'),
            container : $container,
            interactions : interactions
        });
        selector.init({
            attachTo : $('#center3'),
            container : $container,
            interactions : interactions
        });

        $container.on('selected', function(e, qtiClass, $trigger){
            if(qtiClass === 'hotspotInteraction'){
                QUnit.assert.ok($('#center1 .element-list li[data-qti-class=hotspotInteraction]').hasClass('active'),'hotspotInteraction selected');
            }else if(qtiClass === 'choiceInteraction'){
                QUnit.assert.ok($('#center1 .element-list li[data-qti-class=choiceInteraction]').hasClass('active'),'choiceInteraction selected');
                QUnit.assert.ok(!$('#center1 .element-list li[data-qti-class=hotspotInteraction]').hasClass('active'),'hotspotInteraction unselected');
            }else if(qtiClass === '_container'){
                QUnit.assert.ok($('#center1 .element-list li[data-qti-class=_container]').hasClass('active'),'_container selected');
                QUnit.assert.ok(!$('#center1 .element-list li[data-qti-class=choiceInteraction]').hasClass('active'),'choiceInteraction unselected');
            }
        });
        
        $container.find('#center1 .element-list li[data-qti-class=hotspotInteraction]').click();
        selector.activateElement($('#center1'), 'choiceInteraction');
        selector.activateElement($('#center1'), '_container');
        
    });

});