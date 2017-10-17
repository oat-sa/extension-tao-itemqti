define([
    'lodash',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/main',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/oat',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/ims',
    'taoQtiItem/qtiItem/helper/util'
], function(_, tpl, oatTpl, imsTpl, util){
    'use strict';

    var templates = {
        'http://www.imsglobal.org/xsd/portableCustomInteraction' : oatTpl,
        'http://www.imsglobal.org/xsd/portableCustomInteraction_v1' : imsTpl
    };

    return {
        qtiClass : 'customInteraction',
        template : tpl,
        getData : function(interaction, data){
            console.log(data);

            var markupNs = interaction.getMarkupNamespace();
            data.markup = util.addMarkupNamespace(interaction.markup, markupNs ? markupNs.name : '');

            data.portableCustomInteraction = _.isFunction(templates[interaction.xmlns]) ? templates[interaction.xmlns].call(null, data) : '';
            return data;
        }
    };
});