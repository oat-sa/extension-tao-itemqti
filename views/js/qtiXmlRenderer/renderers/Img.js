define(['lodash', 'tpl!taoQtiItem/qtiXmlRenderer/tpl/element'], function(_, tpl){
    'use strict';

    return {
        qtiClass : 'img',
        template : tpl,
        getData : function(item, data) {

            for (let key in data.attributes) {
                if (data.attributes.hasOwnProperty(key)) {
                    let val = data.attributes[key];
                    data.attributes[key] = (typeof val === 'string') ? _.escape(val) : val;
                }
            }

            return data;
        }
    };
});