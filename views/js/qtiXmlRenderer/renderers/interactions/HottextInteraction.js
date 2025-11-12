define([
    'taoQtiItem/qtiXmlRenderer/renderers/Container',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/hottextInteraction'
], function(ContainerRenderer, tpl){
    return {
        qtiClass: 'hottextInteraction',
        template: tpl,
        getData: function(interaction, data) {
            if (data.body && typeof ContainerRenderer.wrapMediaElements === 'function') {
                data.body = ContainerRenderer.wrapMediaElements(data.body);
            }
            return data;
        }
    };
});
