/**
 * @author Sam <sam@taotesting.com>
 * @requires jquery
 */
define(['jquery', 'taoQtiItem/qtiCreator/core/qtiElements', 'taoQtiItem/qtiItem/core/Element', 'ckeditor', 'jqueryui'], function($, QtiElements, Element, CKEditor){

    'use strict';
    var CL = console ? console.log : function(){
    };

    if(CKEditor){
        CKEditor.dtd.$editable.span = 1;
        CKEditor.dtd.$editable.li = 1;
        CKEditor.disableAutoInline = true;
    }else{
        $.error('missing required lib ck editor');
    }

    $.fn.findNoNested = function(selector){
        var id = $(this).attr('id');
        return $(this).find(selector).filter(function(){
            return id && (id == $(this).parent().closest('#' + id + "," + selector).attr('id'));
        });
    };

    $.fn.qtiContainerEditor = function(options){

        var opts = {};
        var method = '';
        var args = [];
        var ret = undefined;
        if(typeof options === 'object'){
            opts = $.extend({}, $.fn.qtiContainerEditor.defaults, options);
        }else if(options === undefined){
            opts = $.extend({}, $.fn.qtiContainerEditor.defaults);//use default
        }else if(typeof options === 'string'){
            if(typeof methods[options] === 'function'){
                method = options;
                args = Array.prototype.slice.call(arguments, 1);
            }
        }

        this.each(function(){
            var $this = $(this);
            if(method){
                if(isCreated($this)){
                    ret = methods[method].apply($(this), args);
                }else{
                    $.error('call of method of qtiContainerEditor while it has not been initialized');
                }
            }else if(!isCreated($this) && typeof opts === 'object'){
                create($this, opts);
            }
        });

        if(ret === undefined){
            return this;
        }else{
            return ret;
        }
    };

    $.fn.qtiContainerEditor.defaults = {
        'elementClass' : 'itemBody',
        'toolbarGroups' : [
            {name : 'clipboard', groups : ['clipboard', 'undo']},
            {name : 'editing'},
            {name : 'forms'},
            {name : 'basicstyles', groups : ['basicstyles', 'cleanup']},
            {name : 'paragraph', groups : ['list', 'indent', 'blocks', 'align', 'bidi']},
            {name : 'links'},
            {name : 'insert'},
            {name : 'styles'},
            {name : 'colors'},
            {name : 'tools'},
            {name : 'others'}
        ],
        'toolbar' : null
    };

    $.fn.qtiContainerEditor.count = 0;

    var methods = {
        addInsertable : function($elts){
            createInsertable($elts, $(this));
        },
        destroy : function(){
            destroy($(this));
        },
        getContent : function(){
            return getContent($(this));
        },
        setContent : function(content){
            if(content){
                setContent($(this), content);
            }
        }
    };

    /**
     * private methods:
     */
    function isCreated($elt){
        return (typeof $elt.data('qti-editor-options') === 'object');
    }

    function create($elt, options){
        var allowedContent = getAllowedContents(options.elementClass);
        $elt.attr('contenteditable', true).data('qti-editor-options', options);

        document.execCommand('enableObjectResizing', false, false);
        document.execCommand('enableInlineTableEditing', false, false);

        var editor = CKEditor.inline($elt[0], {
            allowedContent : allowedContent,
            toolbarGroups : options.toolbarGroups,
            removeButtons : '',
            on : {
                instanceReady : function(e){
                    CL('ready', e);
                },
                focus : function(e){
                    CL('focused');
                    $elt.addClass('qti-authoring-element-focus');
                    shieldElements($elt, function(){
                        CL('unshield');
                        e.editor.focusManager.blur();
                    });
                },
                blur : function(e){
                    CL('blurred');
                    $elt.removeClass('qti-authoring-element-focus');
                    unshieldElements($elt);
                }

            }
        });

        $elt.data('qti-editor', editor);
    }

    function destroy($elt){
//        CKEditor.instances.item1.destroy();delete CKEditor.instances.item1;

        $elt.data('qti-editor').destroy(false);
        $elt.removeAttr('contentEditable').removeData('qti-editor').removeData('qti-editor-options');
    }

    function getAllowedContents(elementClass){

        var allowedElements = {};
        var xhtmlElements = [];

        var allowedClasses = QtiElements.getAllowedContents(elementClass, true);
        for(var i in allowedClasses){
            var aClass = allowedClasses[i];
            var model = QtiElements.classes[aClass];
            if(model && model.xhtml){
                xhtmlElements.push(aClass);
                if(model.attributes){
                    allowedElements[aClass] = model.attributes.join(',')
                }
            }
        }

        allowedElements[xhtmlElements.join(' ')] = {
            classes : '*',
            attributes : 'id,data-qti-type,data-qti-shielded'
        };

        return allowedElements;
    }

    function createInsertable($el, $to){
        createDraggables($el, $to, {
            drop : function($to, $dropped){

                //a new qti element has been added: update the model + render

                $dropped.off('.qti-drag-drop').attr('id', 'new-interaction').removeClass().addClass('qti-interaction').html(' New Interaction ');
                if($dropped.data('inline')){
                    $dropped.addClass('qti-inline');
                }else if($dropped.data('block')){
                    $dropped.addClass('qti-block');
                }
                createMovable($dropped, $to);
            }
        });
    }

    function createMovable($el, $to){
        createDraggables($el, $to, {
            drop : function($to, $dropped){
                $dropped.replaceWith($el);
            }
        });
    }

    function createDraggables($el, $to, options){
        $el.draggable({
            helper : 'clone',
            opacity : 0.35,
            scroll : false,
            cursorAt : {left : -5, bottom : -5},
            start : function(e, ui){
                if($(this).hasClass('qti-block')){
                    createDroppableBlocks($to, $(this).data('qti-type'), options);
                }else if($(this).hasClass('qti-inline')){
                    createDroppableInlines($to, $(this).data('qti-type'), options);
                }
            },
            stop : function(e, ui){
                destroyDroppables($to);
            }
        });
    }

    function createDroppableInlines($el, qtiElementClass, options){

        var onDrop = (options && typeof options.drop === 'function') ? options.drop : null;

        (function wrap($el){
            QtiElements.getAllowedContainersElements(qtiElementClass, $el).filter(':not(script)').contents().each(function(){
                //a text node
                if(this.nodeType === 3 && !this.nodeValue.match(/^\s+$/)){
                    $(this).replaceWith($.map(this.nodeValue.split(/(\S+)/), function(w){
                        return w.match(/^\s*$/) ? document.createTextNode(w) : $('<span>', {'id' : 'w' + ($.fn.qtiContainerEditor.count++), 'text' : w, 'class' : 'qti-word-wrap'}).get();
                    }));
                }
            });
        }($el));

        var $placeholder = $('<span>', {'id' : 'qti-inline-element-placeholder', 'class' : 'qti-droppable-inline-hover', 'data-inline' : true}).hide();
        $el.after($placeholder);
        var $droppables = $el.find('span.qti-word-wrap').on('mousemove.qti-drag-drop', function(e){
            var w = $(this).width();
            var parentOffset = $(this).offset();
            var relX = e.pageX - parentOffset.left;
            $placeholder.data('dropped', true);
            $placeholder.show().css('display', 'inline-block');
            if(relX < w / 2){
                $(this).before($placeholder);
            }else{
                $(this).after($placeholder);
            }
        });

        $el.droppable({
            activeClass : "qti-droppable-ready",
            hoverClass : "qti-droppable-active",
            drop : function(){
                if($placeholder.data('dropped') && typeof onDrop === 'function'){
                    onDrop($(this), $placeholder);
                }
                $droppables.off('.qti-drag-drop');
            }
        });
    }

    function createDroppableBlocks($el, qtiElementClass, options){

        if(QtiElements.isAllowedClass($el.data('qti-type'), qtiElementClass)){
            return false;
        }
        var onDrop = (options && typeof options.drop === 'function') ? options.drop : null;

        var $placeholder = $('<div>', {'id' : 'qti-block-element-placeholder', 'class' : 'qti-droppable-block-hover', 'data-block' : true}).hide();

        $el.after($placeholder);
        var $collection = $el.find(QtiElements.getChildClasses('block', true, 'xhtml').join(',')).on('mousemove.qti-drag-drop', function(e){
            e.stopPropagation();
            var h = $(this).height();
            var parentOffset = $(this).offset();
            var relY = e.pageY - parentOffset.top;
            $placeholder.data('dropped', true);
            if(relY < h / 2){
                $(this).before($placeholder.show());
            }else{
                $(this).after($placeholder.show());
            }
        });

        $el.droppable({
            activeClass : "qti-droppable-ready",
            hoverClass : "qti-droppable-active",
            drop : function(){
                if($placeholder.data('dropped') && typeof onDrop === 'function'){
                    onDrop($(this), $placeholder)
                }
                $collection.off('.qti-drag-drop');
            }
        });

    }

    function destroyDroppables($el){

        //inline droppables:
        $el.find('span.qti-word-wrap, span.qti-droppable').replaceWith(function(){
            return $(this).text();
        });

        $el.find('#qti-inline-element-placeholder, #qti-block-element-placeholder').remove();
    }

    function shieldElements($editor, callback){

        var $elts = $editor.findNoNested('[data-qti-type]');

        var id = 0;
        $elts.each(function(){

            $(this)
                .attr({'contenteditable' : false, 'data-qti-shielded' : true})
                .wrap($('<div>', {'id' : 'qti-authoring-box-' + id, 'contenteditable' : false, 'class' : 'qti-authoring-shielded'}))
                .before($('<button>', {'id' : 'qti-authoring-box-edit-' + id, 'type' : 'button', 'contenteditable' : false, 'class' : 'qti-authoring-element-button'}));

            var $editButton = $editor.find('#qti-authoring-box-edit-' + id);
            $editButton.on('click', function(e){
                e.preventDefault();
                callback();
                return false;
            }).on('mouseover', function(){
                CL('mouseover button', $(this));
                $(this).parent().addClass('qti-authoring-element-hover');
            }).on('mouseout', function(){
                CL('mouseout button');
                $(this).parent().removeClass('qti-authoring-element-hover');
            });

            id++;
        });
    }

    function unshieldElements($editor){
        var $elts = $editor.find('[data-qti-type][data-qti-shielded=true]');
        CL('unwrapping', $elts);
        $elts.siblings('button').remove();
        $elts.unwrap().removeAttr('data-qti-shielded');
    }

    function getContent($editor){
        return $editor.data('qti-editor').getData();
    }

    function setContent($editor, content){
        
        var data = null;
        if(typeof content === 'string'){
            data = content;
        }else if(content instanceof $){
            data = content.html();
        }else if(content instanceof Element && typeof content.initContainer === 'function'){
            data = content.body();
            setEditorQtiElement($editor, content);
        }
        
        if(data !== null){
            $editor.data('qti-editor').setData(data);//update editor
            setEditorQtiElementContent($editor, data);//update model
        }
    }
    
    function setEditorQtiElement($editor, qtiElement){
        $editor.data('qti-editor-element', qtiElement);
    }
    
    function setEditorQtiElementContent($editor, content){
        var qtiElement = $editor.data('qti-editor-element');
        if(qtiElement instanceof Element){
            qtiElement.body(content);//check integrity? create new elements?
            
            //@todo: render content?
        }
    }
    
});