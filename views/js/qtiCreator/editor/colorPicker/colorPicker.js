define([
    'jquery',
    'lodash',
    'tpl!taoQtiItem/qtiCreator/editor/colorPicker/tpl/popup',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function($, _, popupTpl){

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

        $colorTrigger.on('click.color-picker', function(){

            var color = $input.val();
            var $popup = $(popupTpl()),
                $colorPicker = $popup.find('.color-picker'),
                $colorPickerInput = $popup.find('.color-picker-input');
            
            $colorTrigger.after($popup.show());
            
            // Init the color picker
            $colorPicker.farbtastic($colorPickerInput);

            // Set the color to the currently set on the form init
            $colorPickerInput.val(color).trigger('keyup');
            config.color = color;

            // Populate the input with the color on quitting the modal
            $popup.find('.closer').off('click').on('click', function(){
                $popup.hide();
                $colorPicker.off('.farbtastic');
            });

            //listen to color change
            $colorPicker.off('.farbtastic').on('colorchange.farbtastic', function(e, color){
                $colorTrigger.css('background-color', color);
                $input.val(color).trigger('change');
            });
            
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