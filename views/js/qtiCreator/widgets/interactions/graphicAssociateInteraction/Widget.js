/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery', 'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/states',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
], function($, _, Widget, states, graphic){

    /**
     * The Widget that provides components used by the QTI Creator for the GraphicAssociate Interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/Widget
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/Widget
     */      
    var GraphicAssociateInteractionWidget = _.extend(Widget.clone(), {

        /**
         * Set up the widget
         * @param {Object} options - extra options 
         * @param {String} options.baseUrl - the resource base url
         * @param {jQueryElement} options.choiceForm = a reference to the form of the choices
         */
        initCreator : function(options){
            this.baseUrl = options.baseUrl;
            this.choiceForm = options.choiceForm;

            //call parent initCreator
            Widget.initCreator.call(this);

            this.registerStates(states);
           
            this.createPaper(); 
        },
   
        /**
         * Create a basic Raphael paper with the interaction choices 
         */ 
        createPaper : function(){

            var $container = this.$original;
            var background = this.element.object.attributes;
            this.element.paper = graphic.responsivePaper( 'graphic-paper-' + this.element.serial, {
                width       : background.width, 
                height      : background.height,
                img         : this.baseUrl + background.data,
                imgId       : 'bg-image-' + this.element.serial,
                diff        : $('.image-editor', $container).outerWidth() - $('.main-image-box', $container).outerWidth(),
                container   : $container
            });
            
            //call render choice for each interaction's choices
            _.forEach(this.element.getChoices(), this._currentChoices, this);
        },

        /**
         * Add shape to the Raphel paper for a QTI choice
         * @private
         * @param {Object} choice - the QTI choice 
         */ 
        _currentChoices : function(choice){
            graphic.createElement(this.element.paper, choice.attr('shape'), choice.attr('coords'), {
                id          : choice.serial,
                touchEffect : false
            });
        }
   });

    return GraphicAssociateInteractionWidget;
});
