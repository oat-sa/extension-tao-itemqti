define(['jquery', 'lodash', 'taoQtiItem/qtiCreator/core/qtiContainerEditor'], function($, _){
    
    var CL = console.log;
    var $item = $('#item1');
    
    
    test('create', function(){
        $item.qtiContainerEditor();
        ok(typeof $item.data('qti-editor-options') === 'object' && !_.isEmpty($item.data('qti-editor-options')));
        
        //recreate?
        $item.qtiContainerEditor({});
        ok(typeof $item.data('qti-editor-options') === 'object' && !_.isEmpty($item.data('qti-editor-options')));
    });
    
    //an issue with ck editor after call of method editor.destroy()...
//    test('destroy', function(){
//        $item.qtiContainerEditor('destroy');
//        ok(_.isEmpty($item.data('qti-editor')));
//        ok(_.isEmpty($item.data('qti-editor-options')));
//    });
    
    test('addInsertable', function(){
        ok(!$('.qti-interaction').hasClass('ui-draggable'));
        $item.qtiContainerEditor().qtiContainerEditor('addInsertable', $('.qti-interaction'));
        ok($('.qti-interaction').hasClass('ui-draggable'));
    });
    
    test('getContent', function(){
        var content = $item.qtiContainerEditor().qtiContainerEditor('getContent');
        ok(content);
    });
    
//    test('setContent', function(){
//        var content = '<div>Hello</div>';
//        $item.qtiContainerEditor().qtiContainerEditor('setContent', content);
//        ok(content === $item.qtiContainerEditor('getContent'));
//    });
    
    
});