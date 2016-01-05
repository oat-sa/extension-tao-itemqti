define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCommonRenderer/renderers/ModalFeedback',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/modalFeedback',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'lodash',
    'i18n',
    'jquery',
    'ui/modal'
], function(stateFactory, Active, commonRenderer, formTpl, formElement, _, __, $){

    /**
     * handle z-indices of sidebar and ckeditor
     */
    var indices = (function(){

        var selectors = {
            sidebar : '#item-editor-item-widget-bar',
            cke : '.cke',
            ckeBase : '.cke_inner',
            ckeNose : '.cke_nose',
            ckeToolbar : '.cke_toolbar'
        };

        var raised = false,
            selector,
            elements = {};

        return {
            raise : function(baseIndex){

                var $elem, index;

                baseIndex = parseInt(baseIndex, 10);

                for(selector in selectors){

                    $elem = $(selectors[selector]);

                    index = parseInt($elem.css('z-index'), 10);
                    if(isNaN(index)){
                        index = 100;
                    }

                    elements[selector] = {
                        element : $elem,
                        index : index
                    };

                    $elem.css('z-index', elements[selector].index + baseIndex);
                }
            },
            reset : function(){
                if(!raised){
                    return;
                }
                for(selector in elements){
                    elements[selector].element.css('z-index', elements[selector].index);
                }
            }
        };
    }());

    var _ckeIsReady = function($editable){

        var dfd = new $.Deferred(),
            iteration = 0;

        var poll = function(){

            var editor = $editable.data('editor');

            if(iteration > 20){
                return;
            }

            if(editor){
                dfd.resolve();
            }else{
                setTimeout(poll, 200);
            }

        };
        poll();

        return dfd.promise();
    };

    var ModalFeedbackStateActive = stateFactory.extend(Active, function(){

        var _widget = this.widget,
            $container = this.widget.$container,
            $editable = $container.find('[data-html-editable]');

        $container.modal({
            startClosed : true,
            width : commonRenderer.width
        });
        $container.modal('open');
        $container.css('height', 'auto');

        $.when(_ckeIsReady($editable)).then(function(){
            indices.raise($container.css('z-index'));
        });

        $container.on('closed.modal', function(){
            _widget.changeState('sleep');
        });

        this.widget.offEvents('otherActive');

        //show option form
        this.initForm();
        this.widget.$form.show();

    }, function(){

        var $container = this.widget.$container;

        $container.off('opened.modal').off('.active');
        $container.modal('close');

        // reset ck and sidebar
        indices.reset();

        //close ck tlb
        $container.find('.tlb-button.active[data-role=cke-launcher]').click();

        //destroy and hide it
        this.widget.$form.empty().hide();
    });

    ModalFeedbackStateActive.prototype.initForm = function(){

        var _widget = this.widget;
        var feedbackStyles = _prepareFeedbackStyles(_widget);
        var selectedStyle = _.find(feedbackStyles, {selected : true});
        var selectedCssClass = selectedStyle ? selectedStyle.cssClass : '';
            
        //build form:
        _widget.$form.html(formTpl({
            serial : _widget.element.getSerial(),
            identifier : _widget.element.id(),
            feedbackStyles : feedbackStyles
        }));

        formElement.initWidget(_widget.$form);

        //init data validation and binding
        formElement.setChangeCallbacks(_widget.$form, _widget.element, {
            identifier : function(fb, value){
                fb.id(value);
            },
            feedbackStyle : function(fb, value){
                _setBodyDomClass(fb, value, selectedCssClass);
                selectedCssClass = value;
            }
        });
    };

    function _getBodyDom(feedback){
        return $('<div>').html(feedback.body()).find('.tao-wrapper');
    }

    function _setBodyDomClass(feedback, newClass, oldClass){

        if(oldClass || newClass){
            
            var $wrapper = $('<div>').html(feedback.body());
            var $fbBodyDom = $wrapper.find('.tao-wrapper');
            
            if(!$fbBodyDom.length){
                //create one
                $wrapper.wrapInner('<div class="tao-wrapper">');
                $fbBodyDom = $wrapper.find('.tao-wrapper');
            }
            if(oldClass){
                $fbBodyDom.removeClass(oldClass);
            }
            if(newClass){
                $fbBodyDom.addClass(newClass);
            }
            //set to the model
            feedback.body($wrapper.html());
        }

    }

    function _prepareFeedbackStyles(widget){
        var $fbBody = _getBodyDom(widget.element);
        var styles = [
            {
                cssClass : '',
                title : __('standard')
            },
            {
                cssClass : 'modal-feedback-positive',
                title : __('positive')
            },
            {
                cssClass : 'modal-feedback-negative',
                title : __('negative')
            }
        ];
        return _(styles)
            .filter(function(style){
                return style.cssClass !== undefined;
            }).map(function(style){
            if($fbBody.length && $fbBody.hasClass(style.cssClass)){
                style.selected = true;
            }
            return style;
        }).value();
    }

    return ModalFeedbackStateActive;
});
