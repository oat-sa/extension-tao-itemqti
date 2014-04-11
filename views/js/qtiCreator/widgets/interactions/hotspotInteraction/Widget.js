define([
    'jquery', 'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/states',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
], function($, _, Widget, states, graphic){

    var HotspotInteractionWidget = _.extend(Widget.clone(), {

        initCreator : function(options){

            Widget.initCreator.call(this);

            this.registerStates(states);
           
            this._createPaper(options.baseUrl); 
            
            //call render choice for each interaction's choices
            _.forEach(this.element.getChoices(), this._currentChoices, this);
        },
    
        _createPaper : function(baseUrl){
            var background = this.element.object.attributes;
            this.element.paper = graphic.responsivePaper( 'graphic-paper-' + this.element.serial, {
                width  : background.width, 
                height : background.height,
                img :  baseUrl + background.data,
                container : this.$container
            });
        },

        _currentChoices : function(choice){
            graphic.createElement(this.element.paper, choice.attr('shape'), choice.attr('coords'), {
                id : choice.serial            
            });
        } 
   });

    
    return HotspotInteractionWidget;
});
