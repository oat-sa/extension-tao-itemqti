define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'taoQtiItem/qtiCreator/editor/MathEditor',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/math',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
], function(stateFactory, Active, MathEditor, formTpl, formElement){

    var MathActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    MathActive.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            math = _widget.element,
            mathML = math.mathML,
            tex = math.getAnnotations('latex'),
            display = math.attr('display') || 'inline';

        $form.html(formTpl({
            display : display,
            editMode : 'latex',
            latex : tex,
            mathML : mathML
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

        var mathEditor = new MathEditor({
            tex : tex,
            mathML : mathML,
            display : display,
            buffer : $form.find('.math-buffer')
        });
    };

    return MathActive;
});