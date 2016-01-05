define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/element'], function(tpl){
    return {
        qtiClass : 'modalFeedback',
        template : tpl,
        getData : function getData(fb, data){
            var relatedResponse = fb.data('relatedResponse');
            console.log(fb.serial, relatedResponse.attr('identifier'));
            return data;
        }
    };
});