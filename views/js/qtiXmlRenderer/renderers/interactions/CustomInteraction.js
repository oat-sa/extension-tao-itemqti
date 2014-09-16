define([
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/main',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/properties',
    'lodash',
    'handlebars'
], function(tpl, propertiesTpl, _, Handlebars){

    function renderPciProperties(properties, ns, name){

        var entries = [];

        _.forIn(properties, function(value, key){
            if(_.isObject(value)){
                entries.push({
                    value : renderPciProperties(value, ns, key)
                });
            }else{
                entries.push({
                    key : key,
                    value : value
                });
            }
        });
        
        return propertiesTpl({
            entries : entries,
            ns : ns,
            key : name
        });
    }

    //register the pci properties helper:
    Handlebars.registerHelper('pciproperties', function(properties, ns){
        return renderPciProperties(properties, ns, '');
    });

    function addMarkupNamespace(markup, ns){
        return ns ? markup.replace(/<(\/)?([^!])/g, '<$1' + ns + ':$2') : markup;
    }

    return {
        qtiClass : 'customInteraction',
        template : tpl,
        getData : function(interaction, data){
            var markupNs = interaction.getMarkupNamespace();
            data.markup = addMarkupNamespace(interaction.markup, markupNs ? markupNs.name : '');
            return data;
        }
    };
});