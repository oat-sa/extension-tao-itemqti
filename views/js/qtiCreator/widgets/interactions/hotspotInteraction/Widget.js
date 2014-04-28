define([
    'jquery', 'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/states',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
], function($, _, Widget, states, graphic){

      
    var HotspotInteractionWidget = _.extend(Widget.clone(), {

        initCreator : function(options){

            this.baseUrl = options.baseUrl;
            this.choiceForm = options.choiceForm;

            Widget.initCreator.call(this);

            this.registerStates(states);
           
            this.createPaper(options.baseUrl); 
        },
    
        createPaper : function(){

            var background = this.element.object.attributes;
            this.element.paper = graphic.responsivePaper( 'graphic-paper-' + this.element.serial, {
                width       : background.width, 
                height      : background.height,
                img         : this.baseUrl + background.data,
                imgId       : 'bg-image-' + this.element.serial,
                container   : this.$original
            });
            
            //call render choice for each interaction's choices
            _.forEach(this.element.getChoices(), this._currentChoices, this);
        },

        _currentChoices : function(choice){
            graphic.createElement(this.element.paper, choice.attr('shape'), choice.attr('coords'), {
                id          : choice.serial,
                touchEffect : false
            });
        }
   });

    return HotspotInteractionWidget;
});
