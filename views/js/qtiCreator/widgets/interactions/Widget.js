define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/Widget',
    'taoQtiItem/qtiCreator/editor/widgetToolbar',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/okButton'
], function($, Widget, toolbar, okButtonTpl){

    /**
     * 
     * Create a new widget definition from another prototype.
     */
    var InteractionWidget = Widget.clone();

    /**
     * Optional method to be implemented :
     * Init the widget
     * It should never be called directly in normal usage
     * Here, it is overwriten to accomodate for a new argument 
     * that other widgets does not have: $responseForm
     */
    InteractionWidget.init = function(element, $container, $form, $responseForm, options){
        Widget.init.call(this, element, $container, $form, options);
        this.$responseForm = $responseForm;
        return this;
    };

    /**
     * Optional method to be implemented :
     * Build the widget and return an instance ready to be used
     * Here, it is overwritten to accomodate for a new argument
     * that other widgets does not have: $responseForm
     */
    InteractionWidget.build = function(element, $container, $form, $responseForm, options){
        return this.clone().init(element, $container, $form, $responseForm, options);
    };

    /**
     * Required method to be implemented : 
     * define the states and common structure valid for all states
     */
    InteractionWidget.initCreator = function(){

        Widget.initCreator.call(this);

        //create toolbar and hide it
        this.createToolbar();
        this.createOkButton();
    };

    /**
     * Required method to be implemented : 
     * Define the contaieinr where everything is going on. 
     * It normally used this.$original as the start point : from there, you can wrap, innerWrap
     */
    InteractionWidget.buildContainer = function(){

        var $wrap = $('<div>', {'data-serial' : this.element.serial, 'class' : 'widget-box', 'data-qti-class' : this.element.qtiClass});
        var $interactionContainer = this.$original.wrap($wrap);
        this.$container = $interactionContainer.parent();
    };


    /**
     * Below here, 
     * @returns {_L5.InteractionWidget}
     */

    /**
     * Create a toolbar
     * 
     */
    InteractionWidget.createToolbar = function(){

        var _this = this,
            $toolbar = toolbar.attach([
            [
                {
                    title : 'Question',
                    'class' : 'question-trigger',
                    status : 'off', // on | disabled | off => default
                    fn : function(e){
                        e.stopPropagation();
                        _this.changeState('question');
                    }
                },
                {
                    title : 'Answer',
                    'class' : 'answer-trigger',
                    fn : function(e){
                        e.stopPropagation();
                        _this.changeState('answer');
                    }
                }
            ],
            'spacer',
            [
                {
                    icon : 'bin',
                    'class' : 'delete-trigger',
                    title : 'Delete',
                    fn : function(e){
                        e.stopPropagation();//to prevent direct deleting;
                        var $tlb = arguments[2];
                        $tlb.find('.delete-trigger').removeClass('tlb-button-on').addClass('tlb-button-off');
                        _this.changeState('deleting');
                    }
                }
            ]
        ], {
            target : this.$container,
            title : this.element.qtiClass,
            offsetTop : -5
        });
        $toolbar.attr({'data-edit' : 'active', 'data-for' : this.serial});
        $toolbar.hide();


        //add stateChange event listener to auto toggle the question/answer trigger

        var $triggerQuestion = $toolbar.find('.question-trigger a'),
            $triggerAnswer = $toolbar.find('.answer-trigger a');

        this.beforeStateInit(function(e, element, state){
            if(element.getSerial() === _this.serial){
                switch(state.name){
                    case 'question':
                        $triggerQuestion.removeClass('tlb-text-button-off').addClass('tlb-text-button-on');
                        $triggerAnswer.removeClass('tlb-text-button-on').addClass('tlb-text-button-off');
                        break;
                    case 'answer':
                        $triggerAnswer.removeClass('tlb-text-button-off').addClass('tlb-text-button-on');
                        $triggerQuestion.removeClass('tlb-text-button-on').addClass('tlb-text-button-off');
                        break;
                    case 'sleep':
                        $toolbar.hide();
                        break;
                }
            }
        });

        return this;
    };

    InteractionWidget.createOkButton = function(){

        var _this = this;

        this.$container
            .append($(okButtonTpl())
            .on('click.qti-widget', function(e){
                e.stopPropagation();
                _this.changeState('sleep');
            }));
    };

    return InteractionWidget;
});