define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/MathEditor',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/math',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'lodash',
    'i18n'
], function(stateFactory, Active, MathEditor, formTpl, formElement, inlineHelper, _, __){

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
            mathML = math.mathML || '',
            tex = math.getAnnotation('latex') || '',
            display = math.attr('display') || 'inline',
            editMode = 'latex';

        if(!tex.trim() && mathML.trim()){
            editMode = 'mathml';
        }

        $form.html(formTpl({
            editMode : editMode,
            latex : tex,
            mathml : mathML
        }));

        //init selectboxes
        $form.find('select[name=display]').val(display);
        $form.find('select[name=editMode]').val(editMode);
        $form.children('.panel[data-role="' + editMode + '"]').show();

        //... init standard ui widget
        formElement.initWidget($form);

        this.initFormChangeListener();

    };

    MathActive.prototype.initFormChangeListener = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            math = _widget.element,
            mathML = math.mathML,
            tex = math.getAnnotation('latex'),
            display = math.attr('display') || 'inline',
            $math = $form.find('textarea[name=mathml]'),
            $tex = $form.find('input[name=latex]');


        var mathEditor = new MathEditor({
            tex : tex,
            mathML : mathML,
            display : display,
            buffer : $form.find('.math-buffer'),
            target : _widget.$original
        });

        //init data change callbacks
        formElement.initDataBinding($form, math, {
            display : function(m, value){
                if(value === 'block'){
                    m.attr('display', 'block');
                }else{
                    m.removeAttr('display');
                }
                _widget.rebuild({
                    ready:function(widget){
                        widget.changeState('active');
                    }
                });
            },
            editMode : function(m, value){

                _toggleMode($form, value);
            },
            latex : _.throttle(function(m, value){

                mathEditor.setTex(value).renderFromTex(function(){

                    //saveTex
                    m.setAnnotation('latex', value);

                    //update mathML
                    $math.html(mathEditor.mathML);
                    m.setMathML(mathEditor.mathML);

                    inlineHelper.togglePlaceholder(_widget);
                });

            }, _throttle),
            mathml : _.throttle(function(m, value){

                mathEditor.setMathML(value).renderFromMathML(function(){

                    //save mathML
                    m.setMathML(value);

                    //clear tex:
                    $tex.val('');
                    m.removeAnnotation('latex');

                    inlineHelper.togglePlaceholder(_widget);
                });

            }, _throttle)
        });
    };

    var _toggleMode = function($form, mode){

        var $mathPanel = $form.children('.panel[data-role="mathml"]'),
            $texPanel = $form.children('.panel[data-role="latex"]'),
            $tex = $form.find('input[name=latex]'),
            $math = $form.find('textarea[name=mathml]');

        //toggle form visibility
        $mathPanel.hide();
        $texPanel.hide();
        if(mode === 'latex'){
            $texPanel.show();
        }else if(mode === 'mathml'){
            $mathPanel.show();
            if($tex.val()){
                //show a warning here, stating that the content in TeX will be removed
                if(!$math.hasClass('tooltipstered')){
                    _createWarningTooltip($math);
                }
                $math.tooltipster('show');

            }
        }
    };

    var _createWarningTooltip = function($math){

        var $content = $('<span>')
            .html(__('No MathML conversion to LaTeX is currently available. If you editing MathML here, any LaTex code will be discarded.'));

        $math.tooltipster({
            theme : 'tao-warning-tooltip',
            content : $content,
            delay : 200,
            trigger : 'custom'
        });

        $math.on('focus.mathwarning', function(){
            $math.tooltipster('hide');
        });
    };

    return MathActive;
});