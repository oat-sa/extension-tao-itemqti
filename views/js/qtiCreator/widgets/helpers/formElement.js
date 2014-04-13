define(['lodash', 'ui/incrementer', 'ui/tooltipster', 'ui/selecter', 'ui/groupvalidator'], function(_, spinner, tooltip, select2) {

    var cssClass = {
        errorClass: 'error',
        errorMessageClass: 'validate-error',
    };

    var formElement = {
        initWidget: function($form) {
            spinner($form);
            tooltip($form);
            select2($form);
        },
        initDataBinding: function($form, element, attributes) {

            attributes = attributes || {};

            var callbackCall = function(name, value, $elt) {
                console.log('change', name, value);
                var cb = attributes[name];
                if (_.isFunction(cb)) {
                    cb.call(null, element, name, value, $elt);
                }
            };
            
            $form.off('.databinding');
            $form.on('change.databinding keyup.databinding', ':checkbox, select, :text:not([data-validate])', function() {

                var $elt = $(this),
                    name = $elt.attr('name');

                if ($elt.is(':checkbox')) {

                    callbackCall(name, $elt.prop('checked'), $elt);

                } else if ($elt.prop('tagName') === 'SELECT' || $elt.is(':text')) {

                    callbackCall(name, $elt.val(), $elt);
                }
            });

            $form.groupValidator({
                events:['change', 'blur', {type:'keyup', length:0}]
            });

            $form.on('validated.group.databinding', function(e, valid, elt) {
                
                if (e.namespace === 'group') {
                    
                    var $elt = $(elt),
                        name = $elt.attr('name');

                    if (valid) {
                        callbackCall(name, $elt.val(), $elt);
                    }
                }
            });

        }
    };

    return formElement;
});


