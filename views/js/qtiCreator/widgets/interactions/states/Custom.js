define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Custom',
    'tpl!taoQtiItem/qtiCreator/tpl/notifications/widgetOverlay',
    'i18n',
    'taoQtiItem/qtiCreator/helper/xmlRenderer'
], function(stateFactory, Custom, overlayTpl, __, xmlRenderer){

    var InteractionStateCustom = stateFactory.create(Custom, function(){
        //use default [data-edit="custom"].show();
        this.widget.$container.append(overlayTpl({
            message : __('Custom Response Processing Mode')
        }));
        var $e = this.widget.$container.find('[data-edit=map], [data-edit=correct]').hide();

        //ok button z-index
    }, function(){
        var interaction = this.widget.element;
        var item = interaction.getRootElement();
        var outcomeScore = item.getOutcomeDeclaration('SCORE');
        var rp = item.responseProcessing;
        var rpXml = xmlRenderer.render(rp);

        //create the outcome score if rp required
        if(rpXml && !outcomeScore){
            outcomeScore = item.createOutcomeDeclaration({
                cardinality : 'single',
                baseType : 'float'
            });
            outcomeScore.buildIdentifier('SCORE', false);
        }

        //use default [data-edit="custom"].hide();
        this.widget.$container.children('.overlay').remove();
    });

    return InteractionStateCustom;
});
