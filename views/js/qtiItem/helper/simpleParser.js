define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/helper/util',
    'taoQtiItem/qtiItem/core/Loader'
], function(_, $, util, Loader){
    "use strict";

    var _parsableElements = ['img', 'object', 'printedVariable'];
    var _qtiClassNames = {
        rubricblock : 'rubricBlock',
        printedvariable : 'printedVariable'
    };
    var _qtiAttributesNames = {
        powerform: 'powerForm',
        mappingindicator: 'mappingIndicator'
    };

    var _defaultOptions = {
        ns : {
            math : '',
            include : 'xi'
        },
        loaded : null,
        model : null
    };

    var parser;

    function _getElementSelector(qtiClass, ns){
        return ns ? ns + "\\:" + qtiClass + ','+qtiClass : qtiClass;
    }

    function getQtiClassFromXmlDom($node){

        var qtiClass = $node.prop('tagName').toLowerCase();

        //remove ns :
        qtiClass = qtiClass.replace(/.*:/, '');

        return _qtiClassNames[qtiClass] ? _qtiClassNames[qtiClass] : qtiClass;
    }

    function buildElement($elt){

        var qtiClass = getQtiClassFromXmlDom($elt);

        var elt = {
            qtiClass : qtiClass,
            serial : util.buildSerial(qtiClass + '_'),
            attributes : {}
        };

        $.each($elt[0].attributes, function(){
            var attrName;
            if(this.specified){
                attrName = _qtiAttributesNames[this.name] || this.name;
                elt.attributes[attrName] = this.value;
            }
        });

        return elt;
    }

    function buildMath($elt, options){

        var elt = buildElement($elt);

        //set annotations:
        elt.annotations = {};
        $elt.find(_getElementSelector('annotation', options.ns.math)).each(function(){
            var $annotation = $(this);
            var encoding = $annotation.attr('encoding');
            if(encoding){
                elt.annotations[encoding] = _.unescape($annotation.html());
            }
            $annotation.remove();
        });

        //set math xml
        elt.mathML = $elt.html();

        //set ns:
        elt.ns = {
            name : 'm',
            uri : 'http://www.w3.org/1998/Math/MathML'//@todo : remove hardcoding there
        };

        return elt;
    }

    function buildTooltip(targetHtml, contentId, contentHtml){
        var qtiClass = '_tooltip';

        return {
            elements : {},
            qtiClass : qtiClass,
            serial : util.buildSerial(qtiClass + '_'),
            attributes : {
                'aria-describedby': contentId
            },
            content: contentHtml,
            body: {
                elements : {},
                serial: util.buildSerial('container'),
                body: targetHtml
            }

        };
    }

    function parseContainer($container, options){

        var ret = {
            serial : util.buildSerial('_container_'),
            body : '',
            elements : {}
        };

        _.each(_parsableElements, function(qtiClass){

            $container.find(qtiClass).each(function(){

                var $qtiElement = $(this);
                var element = buildElement($qtiElement, options);

                ret.elements[element.serial] = element;
                $qtiElement.replaceWith(_placeholder(element));

            });

        });

        $container.find(_getElementSelector('math', options.ns.math)).each(function(){

            var $qtiElement = $(this);
            var element = buildMath($qtiElement, options);

            ret.elements[element.serial] = element;
            $qtiElement.replaceWith(_placeholder(element));

        });

        $container.find(_getElementSelector('include', options.ns.include)).each(function(){

            var $qtiElement = $(this);
            var element = buildElement($qtiElement, options);

            ret.elements[element.serial] = element;
            $qtiElement.replaceWith(_placeholder(element));

        });

        $container.find('[data-role="tooltip-target"]').each(function(){
            var element,
                $target = $(this),
                $content,
                contentId = $target.attr('aria-describedBy'),
                contentHtml;

            if (contentId) {
                $content = $container.find('#' + contentId);
                if ($content.length) {
                    contentHtml = $content.html();

                    element = buildTooltip($target.html(), contentId, contentHtml);

                    ret.elements[element.serial] = element;
                    $target.replaceWith(_placeholder(element));
                    $content.remove();
                }
            }
        });

        ret.body = $container.html();

        return ret;
    }

    function _placeholder(element){
        return '{{' + element.serial + '}}';
    }

    parser = {
        parse : function(xmlStr, opts){
            var options = _.merge(_.clone(_defaultOptions), opts || {});

            var $container = $(xmlStr);

            var element = buildElement($container, options);

            var data = parseContainer($container, options);

            var loader;

            if(!_.isUndefined(data.body)){
                element.body = data;
            }

            if(_.isFunction(options.loaded) && options.model){
                loader = new Loader().setClassesLocation(options.model);
                loader.loadAndBuildElement(element, options.loaded);
            }

            return element;
        }
    };

    return parser;
});

