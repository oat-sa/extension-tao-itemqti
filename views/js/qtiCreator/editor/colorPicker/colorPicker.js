define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/helper/popup',
    'tpl!taoQtiItem/qtiCreator/editor/colorPicker/tpl/popup',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function($, _, popup, popupTpl){
    "use strict";
    var _defaults = {};

    function create($colorTrigger, config){

        config = _.defaults(config || {}, _defaults);

        var color, $input = $colorTrigger.siblings('input');

        //set color recorded in the hidden input to the color trigger
        if(config.color){
            color = config.color;
            $input.val(color);
        }else{
            color = $input.val();
        }
        
        $colorTrigger.css('background-color', color);

        var $popup = $(popupTpl());

        $('#item-editor-wrapper').append($popup);

        // basic popup functionality
        popup.init($colorTrigger, { popup: $popup });


        // after popup opens
        $colorTrigger.on('open.popup', function(e, params) {

            var $trigger = $(this),
                $content   = $trigger.parents('.sidebar-popup-content'),
            // this is the input above the trigger, _not_ the one of the color picker
                $titleField   = $content.find('[data-role="title"]'),
            // this is the input of the color picker
                color = $input.val();
            var $colorPicker = params.popup.find('.color-picker'),
                $colorPickerInput = params.popup.find('.color-picker-input');

            var $container = $(this).parents('.sidebar-popup');

            //console.log($panel)

            params.popup.css({ right: $(window).width() - $container.offset().left + 2, top: $titleField.offset().top -$('#item-editor-wrapper').offset().top });
            params.popup.find('h3').text($titleField.val());

            // Init the color picker
            $colorPicker.farbtastic($colorPickerInput);

            // Set the color to the currently set on the form init
            $colorPickerInput.val(color).trigger('keyup');
            config.color = color;

            // Populate the input with the color on quitting the modal
            params.popup.find('.closer').off('click').on('click', function(){
                params.popup.hide();
                $colorPicker.off('.farbtastic');
            });

            //listen to color change
            $colorPicker.off('.farbtastic').on('colorchange.farbtastic', function(e, color){
                $colorTrigger.css('background-color', color);
                $input.val(color).trigger('change');
            });
            
        });

        // after popup closes
        $colorTrigger.on('close.popup', function(e, params) {
            params.popup.find('.color-picker').off('.farbtastic');
        });

   }

    function destroy($trigger){
        $trigger.off('.color-picker');
        $trigger.removeAttr('data-color-picker');
    }
    
    return {
        create : create,
        destroy : destroy
    };
});