define(['tpl!taoQtiDefaultRenderer/tpl/interactions/extendedTextInteraction', 'taoQtiDefaultRenderer/renderers/interactions/Interaction'], function(tpl, Interaction){
    return {
        qtiClass : 'extendedTextInteraction',
        template : tpl,
        render : Interaction.render,
        setResponse : Interaction.setResponse,
        getResponse : Interaction.getResponse
    };
});