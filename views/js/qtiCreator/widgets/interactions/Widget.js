define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/Widget',
    'taoQtiItem/qtiCreator/editor/widgetToolbar'
], function($, Widget, toolbar){

    var InteractionWidget = Widget.clone();

    InteractionWidget.initCreator = function(){

        Widget.initCreator.call(this);

        //create toolbar and hide it
        this.createToolbar();
        this.createOkButton();
    };

    InteractionWidget.buildContainer = function(){
        
        var $wrap = $('<div>', {'data-serial' : this.element.serial, 'class' : 'widget-box'});
        var $interactionContainer = this.$original.wrap($wrap);
        this.$container = $interactionContainer.parent();
    };

    /**
     * Common method for all interactions (at least block ones)
     * 
     * @returns {InteractionWidget}
     */
    InteractionWidget.createToolbar = function(){

        var _this = this,
            $toolbar = toolbar.attach([
            [
                {
                    title : 'Question',
                    class : 'question-trigger',
                    status : 'off', // on | disabled | off => default
                    fn : function(e){
                        e.stopPropagation();
                        _this.changeState('question');
                    }
                },
                {
                    title : 'Answer',
                    class : 'answer-trigger',
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
                    class : 'delete-trigger',
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

        //@todo: use handlebars tpl instead?
        this.$container.append($('<button>', {
            'class' : 'btn-info small',
            'type' : 'button',
            'text' : 'OK',
            'data-edit' : 'active'
        }).css({
            margin : '5px 10px',
            display : 'none'
        }).on('click.qti-widget', function(e){
            e.stopPropagation();
            _this.changeState('sleep');
        }));
    };

    return InteractionWidget;
});