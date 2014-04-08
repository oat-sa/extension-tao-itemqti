define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
], function(_, formElement){

    var formElementHelper = {
        init : function(widget){
            formElement.init(widget.$form);
        },
        initShuffle : function(widget){

            var interaction = widget.element;

            widget.$form.find('[data-role=shuffle]').on('change', function(){

                var $choiceShuffleButtons = widget.$container.find('[data-role="shuffle-pin"]');

                if($(this).prop('checked')){
                    interaction.attr('shuffle', true);
                    $choiceShuffleButtons.show();
                }else{
                    interaction.attr('shuffle', false);
                    $choiceShuffleButtons.hide();
                }
            });
        }
    };

    return formElementHelper;
});