define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiItem/helper/rendererConfig',
    'taoQtiItem/qtiItem/mixin/NamespacedElement'
], function($, _, Element, rendererConfig, NamespacedElement){
    'use strict';

    var Math;

    /**
     * Remove the closing MathML tags and remove useless line breaks before and after it
     *
     * @param {String} mathML
     * @param {String} nsName
     * @returns {String}
     */
    function _stripMathTags(mathML, nsName){
        var regex = new RegExp('<(\/)?' + (nsName ? nsName + ':' : '') + 'math[^>]*>', 'g');
        return mathML.replace(regex, '')
            .replace(/^\s*[\r\n]/gm, '')//remove first blank line
            .replace(/\s*[\r\n]$/gm, '');//last blank line
    }

    /**
     * Remove mathML ns name prefix from the mathML
     *
     * @param {String} mathML
     * @param {String} nsName
     * @returns {String}
     */
    function _stripNamespace(mathML, nsName){
        var regex = new RegExp('<(\/)?' + (nsName ? nsName + ':' : ''), 'g');
        return mathML.replace(regex, '<$1');
    }

    /**
     * Check if the mathML string is to be considered empty
     *
     * @param {String} mathStr
     * @returns {Boolean}
     */
    function _isEmptyMathML(mathStr){
        var $math,
            mathText,
            hasContent = false;

        if(mathStr && mathStr.trim()){
            $math = $($.parseHTML(mathStr));
            mathText = $math.text();
            hasContent = (_.isString(mathText) && !!mathText.trim());
        }

        return !hasContent;
    }

    Math = Element.extend({
        qtiClass : 'math',
        defaultNsName : 'm',
        defaultNsUri : 'http://www.w3.org/1998/Math/MathML',
        nsUriFragment : 'MathML',
        init : function(serial, attributes){
            this._super(serial, attributes);
            this.ns = null;
            this.mathML = '';
            this.annotations = {};
        },
        setAnnotation : function(encoding, value){
            this.annotations[encoding] = _.unescape(value);
        },
        getAnnotation : function(encoding){
            return this.annotations[encoding];
        },
        removeAnnotation : function(encoding){
            delete this.annotations[encoding];
        },
        setMathML : function(mathML){
            var ns = this.getNamespace(),
                nsName = (ns.name && ns.uri) ? ns.name : '';

            mathML = _stripMathTags(mathML, nsName);
            if(ns){
                mathML = _stripNamespace(mathML, nsName);
            }
            this.mathML = mathML;
        },
        getMathML : function(){
            return this.mathML;
        },
        render : function(){

            var args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                tag = this.qtiClass,
                raw = this.mathML,
                body = raw,
                ns = this.getNamespace(),
                annotations = '',
                encoding,
                defaultData;

            for(encoding in this.annotations){
                annotations += '<annotation encoding="' + encoding + '">' + _.escape(this.annotations[encoding]) + '</annotation>';
            }

            if(annotations){
                if(raw.indexOf('</semantics>') > 0){
                    raw = raw.replace('</semantics>', annotations + '</semantics>');
                }else{
                    raw = '<semantics>' + raw + annotations + '</semantics>';
                }
            }

            if (ns && ns.name) {
                body = raw.replace(/<(\/)?([^!<])/g, '<$1' + ns.name + ':$2');
                tag = ns.name + ':' + tag;
            }

            body = body.replace(/<!--.*?-->/g, ''); // remove Mathjax-generated comments
            body = body.replace(/&lt;!--.*?--&gt;/g, ''); // fix for broken items because of Mathjax comments

            defaultData = {
                block : (this.attr('display') === 'block') ? true : false,
                body : body,
                raw : raw,
                tag : tag,
                ns : ns
            };

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        isEmpty : function(){
            return _isEmptyMathML(this.mathML) && (!this.annotations.latex || !this.annotations.latex.trim());
        }
    });

    NamespacedElement.augment(Math);

    return Math;
});
