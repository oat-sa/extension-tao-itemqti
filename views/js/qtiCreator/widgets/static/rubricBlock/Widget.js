define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/rubricBlock/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/textBlock',
    'taoQtiItem/qtiCreator/helper/htmlEditor'
], function(Widget, states, toolbarTpl, htmlEditor) {

    var RubricBlockWidget = Widget.clone();

    RubricBlockWidget.buildContainer = function() {
        this.$container = this.$original.addClass('widget-box');
    };

    RubricBlockWidget.initCreator = function() {

        Widget.initCreator.call(this);

        this.registerStates(states);

        this.buildEditor();
    };

    RubricBlockWidget.createToolbar = function() {
        
        var $tlb = $(toolbarTpl({
                serial: this.serial,
                state: 'active'
            })),
            _this = this;
        
        this.$container.find('.qti-rubricBlock-body').after($tlb);
        
        $tlb.find('[data-role="delete"]').on('click.widget-box', function(e){
            e.stopPropagation();//to prevent direct deleting;
            _this.changeState('deleting');
        });

        return this;
    };

    RubricBlockWidget.buildEditor = function() {

        var _this = this,
            $editableContainer = this.$container,
            rubricBlock = this.element;

        $editableContainer.attr('data-html-editable-container', true);

        if (!htmlEditor.hasEditor($editableContainer)) {

            htmlEditor.buildEditor($editableContainer, {
                change: function(data) {
                    rubricBlock.body(data);
                },
                focus: function() {
                    _this.changeState('active');
                }
            });
        }
    };

    return RubricBlockWidget;
});