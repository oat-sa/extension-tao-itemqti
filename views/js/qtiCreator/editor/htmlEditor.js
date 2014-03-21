define(['lodash', 'jquery', 'ckeditor'], function(_, $, CKEditor){

    //prevent auto inline editor creation:
    CKEditor.disableAutoInline = true;
    
    //CKEDITOR.dtd.$editable.span = 1;//buggy!

    var _buildEditor = function($editable, $editableContainer, options){

        var $trigger;
        options = options || {};

        if(!$editable instanceof $ || !$editable.length){
            throw 'invalid jquery element for $editable';
        }
        if(!$editableContainer instanceof $ || !$editableContainer.length){
            throw 'invalid jquery element for $editableContainer';
        }

        $trigger = $editableContainer.find('[data-role="cke-launcher"]');

        return CKEditor.inline($editable[0], {
            toolbarGroups : [
                {name : 'basicstyles', groups : ['basicstyles', 'cleanup']},
                {name : 'paragraph', groups : ['list', 'indent', 'blocks', 'align']},
            ],
            autoParagraph : false,
            removePlugins : 'resize,elementspath',
            floatSpaceDockedOffsetY : 10,
            floatSpace : {
                debug : true,
                initialHide : true,
                centerElement : function(){
                    //cke initialize the config too early.. so need to provide a callback to initialize it...
                    return $editableContainer.find('[data-role="cke-launcher"]')[0];
                },
                on : {
                    ready : function(floatSpaceApi){

                        floatSpaceApi.hide();
                        //@todo namespace this event: .editor.qti-widget or stuff...
                        $trigger.on('click', function(){
                            if($trigger.hasClass('active')){
                                $trigger.removeClass('active');
                                floatSpaceApi.hide();
                            }else{
                                $trigger.addClass('active');
                                floatSpaceApi.show();
                            }
                        });

                    },
                    changeMode : function(oldMode, newMode){
                        if(oldMode !== newMode){
                            $(this).find('.cke_nose').removeClass('float-space-' + oldMode).addClass('float-space-' + newMode);
                        }
                    }
                }
            },
            on : {
                instanceReady : function(e){
                    e.editor.on('change', function(e){
                        //callback:
                        if(_.isFunction(options.change)){
                            options.change.call(this, this.getData());
                        }
                    });
                },
                focus : function(e){
                    //show trigger 
                    $editableContainer.find('[data-role="cke-launcher"]').hide();
                    $trigger.show();

                    //shield inner qti elements:

                    //callback:
                    if(_.isFunction(options.focus)){
                        options.focus.call(this, this.getData());
                    }
                },
                blur : function(e){
                    //unshield inner qti element
                    $trigger.hide();
                }
            }
        });
    };

    var _find = function($container, dataAttribute){

        var $collection;

        if($container.data(dataAttribute)){
            $collection = $container;
        }else{
            $collection = $container.find('[data-' + dataAttribute + '=true]');
        }
        return $collection;
    };

    var editorFactory = {
        /**
         * Check if all data-html-editable has an editor
         * 
         * @param {type} $container
         * @returns {undefined}
         */
        hasEditor : function($container){

            var hasEditor = false;

            _find($container, 'html-editable').each(function(){
                hasEditor = !!$(this).data('editor');
                return hasEditor;//continue if true, break if false
            });

            return hasEditor;
        },
        buildEditor : function($container, editorOptions){

            _find($container, 'html-editable-container').each(function(){

                var editor,
                    $editableContainer = $(this),
                    $editable = $editableContainer.find('[data-html-editable]');

                //need to make the element html editable to enable ck inline editing:
                $editable.attr('contenteditable', true);

                //build it
                editor = _buildEditor($editable, $editableContainer, editorOptions);

                //store it in editable elt data attr
                $editable.data('editor', editor);
            });

        },
        destroyEditor : function($container){

            _find($container, 'html-editable-container').each(function(){

                var $editableContainer = $(this),
                    $editable = $editableContainer.find('[data-html-editable]');

                $editableContainer.find('[data-role="cke-launcher"]')
                    .off()
                    .removeClass('active')
                    .hide();

                $editable.removeAttr('contenteditable');
                if($editable.data('editor')){
                    $editable.data('editor').destroy();
                    $editable.removeData('editor');
                }
            });

        }
    };

    return editorFactory;
});