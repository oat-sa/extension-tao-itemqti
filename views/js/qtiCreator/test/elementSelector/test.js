require([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/editor/elementSelector/selector',
    'json!taoQtiItem/qtiCreator/test/elementSelector/interactions'
], function(_, $, selector, interactions){
    
    test('init dialog', function(){

        expect(0);
        
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
        
    });
    
});