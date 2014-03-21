define(['lodash', 'taoQtiItem/qtiItem/core/Element'], function(_, Element){

    var _stripMathTags = function(mathML, nsName){
        var regex = new RegExp('<(\/)?' + (nsName ? nsName + ':' : '') + 'math[^>]*>', 'g');
        return mathML.replace(regex, '')
            .replace(/^\s*[\r\n]/gm, '')//remove first blank line
            .replace(/\s*[\r\n]$/gm, '');//last blank line
    };

    var _stripNamespace = function(mathML, nsName){
        var regex = new RegExp('<(\/)?' + (nsName ? nsName + ':' : ''), 'g');
        return mathML.replace(regex, '<$1');
    };

    var Math = Element.extend({
        qtiClass : 'math',
        defaultNsName : 'm',
        defaultNsUri : 'http://www.w3.org/1998/Math/MathML',
        init : function(serial, attributes){
            this._super(serial, attributes);
            this.ns = null;
        },
        getNamespace : function(){
            if(this.ns){
                return _.clone(this.ns);
            }else{
                var namespaces = this.getRelatedItem().getNamespaces();
                for(ns in namespaces){
                    if(namespaces[ns].indexOf('MathML') > 0){
                        return {
                            name : ns,
                            uri : namespaces[ns]
                        };
                    }
                }
            }
            return {};
        },
        setNamespace : function(name, uri){
            this.ns = {
                name : name,
                uri : uri
            };
        },
        setAnnotation : function(encoding, value){
            this.annotation[encoding] = value;
        },
        getAnnotations : function(encoding){
            return this.annotation[encoding];
        },
        setMathML : function(mathML){
            var ns = this.getNamespace(),
                nsName = (ns.name && ns.uri) ? ns.name : '';

            mathML = _stripMathTags(mathML, nsName);
            if(ns){
                mathML = _stripNamespace(mathML, nsName)
            }
            this.mathML = mathML;
        },
        getMathML : function(){
            return this.mathML;
        },
        render : function(data, $container){
            
            var tag = this.qtiClass,
                body = this.mathML,
                ns = this.getNamespace(),
                annotations = '';

            for(var encoding in this.annotations){
                annotations += '<annotation encoding="' + encoding + '">' + this.annotations[encoding] + '</annotation>';
            }

            if(annotations){
                if(body.indexOf('</semantics>') > 0){
                    body = body.replace('</semantics>', annotations + '</semantics>');
                }else{
                    body = '<semantics>' + body + annotations + '</semantics>';
                }
            }

            if(ns && ns.name){
                body = body.replace(/<(\/)?([^!])/g, '<$1' + ns.name + ':$2');
                tag = ns.name + ':' + tag;
            }

            var defaultData = {
                block : (this.attr('display') === 'block') ? true : false,
                body : body,
                tag : tag,
                ns : ns
            };
            return this._super(_.merge(defaultData, data || {}), $container);
        }
    });

    return Math;
});