define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/math',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
], function(stateFactory, Active, formTpl, formElement){

    var MathActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    MathActive.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            math = _widget.element;

        $form.html(formTpl({
            display : math.attr('display') || 'inline',
            editMode : 'latex',
            latex : math.getAnnotations('latex'),
            mathML : math.mathML
        }));
        
        //... init standard ui widget
//        formElement.initWidget($form);

        //init data change callbacks
        formElement.initDataBinding($form, math, {
            display : function(m, value){
                if(value === 'block'){
                    m.attr('display', 'block');
                }else{
                    m.removeAttr('display');
                }
            },
            editMode : function(){
            
            }
        });
    };

    return MathActive;
});