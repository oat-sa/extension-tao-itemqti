
define([
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/portableInfoControl',
    'taoQtiItem/qtiItem/helper/util',
    'taoQtiItem/qtiXmlRenderer/helper/portableElementTpl'
], function(tpl, util){
    'use strict';

    return {
        qtiClass : 'infoControl',
        template : tpl,
        getData : function(infoControl, data){
            data.markup = infoControl.markup;

            //ensure infoControl have an id, otherwise generate one in order to be able to identify it for the state
            if(!infoControl.attr('id')){
                infoControl.attr('id', util.buildId(infoControl.getRootElement(), infoControl.typeIdentifier ));
            }

            return data;
        }
    };
});
