define(['lodash', 'jquery', 'taoQtiItem/qtiItem/helper/util'], function(_, $, util){

    var _parsableElements = ['img', 'object'];

    var _defaultOptions = {
        ns : {
            math : ''
        }
    };

    function buildElement($elt){

        var qtiClass = $elt.prop('tagName').toLowerCase();

        var elt = {
            qtiClass : qtiClass,
            serial : util.buildSerial(qtiClass + '_'),
            attributes : {}
        };

        $.each($elt[0].attributes, function(){
            if(this.specified){
                elt.attributes[this.name] = this.value;
            }
        });

        return elt;
    }

    function buildMath($elt){

        var elt = buildElement($elt);

        elt.mathML = $elt.html();
        elt.annotations = {};

        return elt;
    }

    function parseContainer($container, opts){

        var options = _.merge(_.clone(_defaultOptions), opts || {});

        var ret = {
            serial : util.buildSerial('_container_'),
            body : '',
            elements : {}
        };

        _.each(_parsableElements, function(qtiClass){

            $container.find(qtiClass).each(function(){

                var $qtiElement = $(this);
                var element = buildElement($qtiElement);

                ret.elements[element.serial] = element;
                $qtiElement.replaceWith(_placeholder(element));

            });

        });

        var mathSelector = options.ns.math ? options.ns.math + "\\:math" : 'math';
        $container.find(mathSelector).each(function(){
            
            var $qtiElement = $(this);
            var element = buildMath($qtiElement);

            ret.elements[element.serial] = element;
            $qtiElement.replaceWith(_placeholder(element));

        });

        ret.body = $container.html();

        return ret;
    }

    function _placeholder(element){
        return '{{' + element.serial + '}}';
    }

    var parser = {
        parse : function(xmlStr, options){

            var $container = $(xmlStr);
            
            var element = buildElement($container, options);

            var data = parseContainer($container, options);

            if(data.body){
                element.body = data;
            }

            return element;
        }
    };

    return parser;
});

