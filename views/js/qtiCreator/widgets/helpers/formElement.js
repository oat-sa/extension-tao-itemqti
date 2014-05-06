define([
    'lodash',
    'ui/incrementer',
    'ui/tooltipster',
    'ui/selecter',
    'ui/toggler',
    'ui/inplacer',
    'ui/groupvalidator',
    'taoQtiItem/qtiCreator/widgets/helpers/validators'
], function(_, spinner, tooltip, select2, toggler){

    var formElement = {
        initWidget : function($form){
            spinner($form);
            tooltip($form);
            select2($form);
            toggler($form);
        },
        initDataBinding : function($form, element, attributes){

            attributes = attributes || {};

            var _callbackCall = function(name, value, $elt){
                var cb = attributes[name];
                if(_.isFunction(cb)){
                    cb.call($elt[0], element, value, name);
                }
            };

            var callback = {
                simple : function(){

                    var $elt = $(this),
                        name = $elt.attr('name');

                    if($elt.is(':checkbox')){
                        _callbackCall(name, $elt.prop('checked'), $elt);
                    }else{
                        _callbackCall(name, $elt.val(), $elt);
                    }

                },
                withValidation : function(e, valid, elt){
                
                    if(e.namespace === 'group'){

                        var $elt = $(elt),
                            name = $elt.attr('name');

                        if(valid){
                            _callbackCall(name, $elt.val(), $elt);
                        }
                    }
                }
            };

            $form.off('.databinding');
            $form.on('change.databinding keyup.databinding', ':checkbox, :radio, select, :text:not([data-validate])', callback.simple);
            $form.on('keyup.databinding input.databinding propertychange.databinding', 'textarea', callback.simple);

            $form.groupValidator({
                events : ['change', 'blur', {type : 'keyup', length : 0}],
                callback : _validationCallback
            });

            $form.on('validated.group.databinding', callback.withValidation);

        },
        initTitle : function($form, element){

            var $title = $form.hasClass('qti-title') ? $form : $form.find('.qti-title');

            $title.inplacer({
                target : $('#qti-title')
            });

            $title.on('change', function(){
                element.attr('title', $(this).text());
            });
        },
        /**
         * the simplest form of save callback used in data binding 
         * @param {boolean} allowEmpty
         */
        getAttributeChangeCallback : function(allowEmpty){

            return function(element, value, name){
                if(!allowEmpty && value === ''){
                    element.removeAttr(name);
                }else{
                    element.attr(name, value);
                }
            }
        },
        getMinMaxAttributeCallbacks : function($form, attributeNameMin, attributeNameMax){

            var $max = $form.find('input[name=' + attributeNameMax + ']'),
                callbacks = {};

            callbacks[attributeNameMin] = function(interaction, value, name){

                var newOptions = {min : null};

                if(value === ''){
                    interaction.removeAttr(name);
                }else{
                    value = parseInt(value);
                    interaction.attr(name, value);
                    newOptions.min = value;

                    var max = parseInt($max.val());
                    if(max < value){
                        $max.val(value);
                    }
                }

                //set incrementer min value for maxChoices and trigger keyup event to launch validation
                $max.incrementer('options', newOptions).keyup();
            };

            callbacks[attributeNameMax] = function(interaction, value, name){
                
                var responseDeclaration = interaction.getResponseDeclaration();
                value = value || 0;
                
                if(value <= 1){
                    responseDeclaration.attr('cadinality', 'single');
                }else{
                    responseDeclaration.attr('cadinality', 'multiple');
                }
                
                interaction.attr(name, value);
            };

            return callbacks;
        }
    };

    var _validationCallback = function _validationCallback(valid, results){

        var $input = $(this), rule;

        _createTooltip($input);

        $input.tooltipster('hide');

        if(!valid){

            //invalid input!
            rule = _.where(results, {type : 'failure'})[0];
            if(rule && rule.data.message){
                $input.tooltipster('content', rule.data.message);
                $input.tooltipster('show');
            }

        }
    };

    var _createTooltip = function($input){
        if(!$input.hasClass('tooltipstered')){
            $input.tooltipster({
                theme : 'tao-error-tooltip',
                content : '',
                delay : 350,
                trigger : 'custom'
            });
        }
    };

    return formElement;
});


