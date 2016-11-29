define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/hottext'
], function($, stateFactory, QuestionState, gapTpl){
    'use strict';

    var HottextStateQuestion = stateFactory.extend(QuestionState);

    HottextStateQuestion.prototype.createToolbar = function(){

        var _widget = this.widget,
            $container = _widget.$container,
            hottext = _widget.element,
            $toolbar = $container.find('.mini-tlb').not('[data-html-editable] *');

        if(!$toolbar.length){

            //add mini toolbars
            $toolbar = $(gapTpl({
                serial : hottext.getSerial(),
                state : 'question'
            }));

            $container.append($toolbar);

            //init delete:
            $toolbar.find('[data-role=restore]').on('mousedown.question', function(){
                var inlineStaticElements = hottext.getElements(),
                    parent = hottext.parent(),
                    newBody = parent.body().replace(hottext.placeholder(), hottext.body()),
                    serial,
                    elt;

                for (serial in inlineStaticElements) {
                    if (inlineStaticElements.hasOwnProperty(serial)) {
                        elt = hottext.getElement(serial);
                        parent.setElement(elt);
                        hottext.removeElement(elt);
                    }
                }

                parent.body(newBody);

                $container.replaceWith(hottext.body());
                _widget.destroy();
                hottext.remove();

                parent.render(parent.data('widget').$container);
                parent.postRender();
            });
        }

        return $toolbar;
    };

    return HottextStateQuestion;
});
