define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/text/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger',
    'taoQtiItem/qtiCreator/helper/htmlEditor'
], function(Widget, states, toolbarTpl, htmlEditor){

    var TextWidget = Widget.clone();

    TextWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
        
        this.generateSerial();
        
        this.buildEditor();
    };
    
    TextWidget.generateSerial = function() {

        this.serial = 'text_widget_serial_1';

        return this;
    };
    
    TextWidget.createToolbar = function() {

        this.$container.append(toolbarTpl({
            serial: this.serial,
            state: 'active'
        }));

        return this;
    };

    TextWidget.buildEditor = function() {

        var _this = this,
            $editableContainer = this.$container,
            item = this.element;

        $editableContainer.attr('data-html-editable-container', true);

        if (!htmlEditor.hasEditor($editableContainer)) {

            htmlEditor.buildEditor($editableContainer, {
                change: function(data) {
                    $editableContainer.trigger('textChange.qti-edit', [data]);
                },
                focus: function() {
                    _this.changeState('active');
                }
            });
        }
    };
    
    return TextWidget;
});