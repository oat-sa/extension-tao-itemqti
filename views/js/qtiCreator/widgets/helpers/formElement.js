define([
    'lodash',
    'ui/incrementer', 
    'ui/tooltipster', 
    'ui/selecter', 
    'ui/inplacer', 
    'ui/groupvalidator',
    'taoQtiItem/qtiCreator/widgets/helpers/validators'
], function(_, spinner, tooltip, select2){
    
    var formElement = {
        initWidget : function($form){
            spinner($form);
            tooltip($form);
            select2($form);
        },
        initDataBinding : function($form, element, attributes){

            attributes = attributes || {};

            var callbackCall = function(name, value, $elt){
                console.log('change', name, value);
                var cb = attributes[name];
                if(_.isFunction(cb)){
                    cb.call($elt[0], element, value, name);
                }
            };

            $form.off('.databinding');
            $form.on('change.databinding keyup.databinding', ':checkbox, select, :text:not([data-validate])', function(){

                var $elt = $(this),
                    name = $elt.attr('name');

                if($elt.is(':checkbox')){

                    callbackCall(name, $elt.prop('checked'), $elt);

                }else if($elt.prop('tagName') === 'SELECT' || $elt.is(':text')){

                    callbackCall(name, $elt.val(), $elt);
                }
            });

            $form.groupValidator({
                events : ['change', 'blur', {type : 'keyup', length : 0}],
                callback: _validationCallback
            });

            $form.on('validated.group.databinding', function(e, valid, elt){

                if(e.namespace === 'group'){

                    var $elt = $(elt),
                        name = $elt.attr('name');

                    if(valid){
                        callbackCall(name, $elt.val(), $elt);
                    }
                }
            });

        },
        initTitle : function($form, element){

            var $title = $form.hasClass('qti-title') ? $form : $form.find('.qti-title');
            
            $title.inplacer({
                target : $('#qti-title')
            });

            $title.on('change', function(){
                element.attr('title', $(this).text());
            });
        }
    };
    
    var _validationCallback = function _validationCallback(valid, results){
        
        var $input = $(this), rule;
        
        _createTooltip($input);
        
        $input.tooltipster('hide');
        
        if(!valid){
            
            //invalid input!
            rule = _.where(results, {type: 'failure'})[0];
            if (rule && rule.data.message) {
                $input.tooltipster('content', rule.data.message);
                $input.tooltipster('show');
            }
                
        }
    };
    
    var _createTooltip = function($input){
        if (!$input.hasClass('tooltipstered')) {
            $input.tooltipster({
                theme: 'tao-error-tooltip',
                content: '',
                delay: 350,
                trigger: 'custom'
            });
        }
    };
    
    return formElement;
});


