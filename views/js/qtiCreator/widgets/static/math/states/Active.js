define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'taoQtiItem/qtiCreator/editor/MathEditor',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/math',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'lodash'
], function(stateFactory, Active, MathEditor, formTpl, formElement, _){

    var _throttle = 300;

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
            tex = math.getAnnotation('latex'),
            display = math.attr('display') || 'inline';

        $form.html(formTpl({
            display : display,
            editMode : 'latex',
            latex : tex,
            mathml : mathML
        }));

        var $math = $form.find('textarea[name=mathml]');

        var mathEditor = new MathEditor({
            tex : tex,
            mathML : mathML,
            display : display,
            buffer : $form.find('.math-buffer'),
            target : _widget.$original
        });
        console.log(mathEditor);

        //... init standard ui widget
        formElement.initWidget($form);

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
                //toggle form visibility
            },
            latex : _.throttle(function(m, value){

                mathEditor.setTex(value);
                mathEditor.renderFromTex(function(){

                    m.setAnnotation('latex', value);

                    //update mathML
                    $math.html(mathEditor.mathML);
                    m.setMathML(mathEditor.mathML);
                });

            }, _throttle),
            
            mathml : _.throttle(function(m, value){
                
                mathEditor.setMathML(value).renderFromMathML(function(){
                    m.setMathML(value);
                    m.removeAnnotation('latex');
                });
                
            }, _throttle)
        });


    };

    return MathActive;
});