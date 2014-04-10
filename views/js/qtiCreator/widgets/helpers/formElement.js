define(['lodash', 'ui/incrementer', 'ui/tooltipster', 'ui/selecter', 'ui/groupvalidator'], function(_, spinner, tooltip, select2){

    var cssClass = {
        errorClass : 'error',
        errorMessageClass : 'validate-error',
    };

    var formElement = {
        initWidget : function($form){
            spinner($form);
            tooltip($form);
            select2($form);
        },
        initDataBinding : function($form, element, attributes){

            attributes = attributes || {};

            var callbackCall = function(name, value){
                console.log('change', name, value);
                var cb = attributes[name];
                if(_.isFunction(cb)){
                    cb.call(null, element, value);
                }
            };
                
            $form.on('change keyup', ':checkbox, select, :text:not([data-validate])', function(){
                
//                console.log($(this), $(this).prop('tagName'), $(this).attr('type'), $(this).attr('name'), $(this).val());
                var $elt = $(this),
                    name = $elt.attr('name');
                    
                if($elt.is(':checkbox')){
                    
                    callbackCall(name, $elt.prop('checked'));
                    
                }else if($elt.prop('tagName') === 'SELECT' || $elt.is(':text')){
                    
                    callbackCall(name, $elt.val());
                }
            });

            $form.groupValidator();
            return;
            
            $form.on('validated.group', function(valid, elt){
                
                var $elt = $(elt),
                    name = $elt.attr('name');

                if(valid){
                    callbackCall(name, $elt.val());
                }else{

                }
            });

        }
    };

    return formElement;
});


