define(['tpl!taoQtiDefaultRenderer/tpl/interactions/inlineChoiceInteraction', 'taoQtiDefaultRenderer/renderers/interactions/Interaction'], function(tpl, Interaction){
    return {
        qtiClass : 'inlineChoiceInteraction',
        template : tpl,
        render : Interaction.render,
        setResponse : Interaction.setResponse,
        getResponse : Interaction.getResponse
    };
});