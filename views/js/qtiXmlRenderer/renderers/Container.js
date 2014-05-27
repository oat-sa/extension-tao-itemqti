define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/container'], function(tpl){
    
    var htmlToXml = function(html){
        //@todo : check other names entities
        return html.replace(/&nbsp;/g, '&#160;');
    };
    
    return {
        qtiClass : '_container',
        template : tpl,
        getData:function(container, data){
            data.body = htmlToXml(data.body);
            return data;
        }
    };
});