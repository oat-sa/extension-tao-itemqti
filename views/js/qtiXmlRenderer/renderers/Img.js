define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/element', 'lodash'], function(tpl, _){
    return {
        qtiClass : 'img',
        template : tpl,
        getData : function(img, data){
            data.attributes.src = _.escape(data.attributes.src);
            return data;
        }
    };
});