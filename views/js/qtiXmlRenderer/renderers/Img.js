define(['lodash', 'tpl!taoQtiItem/qtiXmlRenderer/tpl/element'], function(_, tpl){
    'use strict';

    return {
        qtiClass : 'img',
        template : tpl,
        getData : function(item, data) {

            data.attributes = _.mapValues(data.attributes, function (val) {
                return _.isString(val) ? _.escape(val) : val;
            });

            return data;
        }
    };
});