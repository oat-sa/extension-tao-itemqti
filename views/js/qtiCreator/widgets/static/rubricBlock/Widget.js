define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/rubricBlock/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger',
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

        this.$container.append(toolbarTpl({
            serial: this.serial,
            state: 'active'
        }));

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