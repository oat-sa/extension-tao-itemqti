define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/element'], function(tpl){
    return {
        qtiClass : 'rubricBlock',
        template : tpl,
        getData: function(rubricBlock, data) {
            const newData = {
                view: data.attributes.view ? Array.from(data.attributes.view).join(' ') : ''
            };
            return Object.assign({}, data || {}, newData);
        }
    };
});