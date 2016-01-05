define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/element'], function(tpl){
    return {
        qtiClass : 'modalFeedback',
        template : tpl,
        getData : function getData(fb, data){
            data.feedbackClass = fb.data('feedbackClass');
            return data;
        }
    };
});