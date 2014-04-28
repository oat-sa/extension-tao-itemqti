define(['jquery', 'mathJax'], function($, MathJax){

    var MathEditor = function MathEditor(config){

        config = config || {};

        this.mathML = config.mathML || '';
        this.tex = config.tex || '';
        this.display = config.display || 'inline';

        //computed, system variables:
        this.processing = false;

        if(config.buffer && config.buffer instanceof $ && config.buffer.length){
            this.$buffer = config.buffer;
        }else{
            throw 'missing required element in config "buffer"';
        }
    };

    MathEditor.prototype.setMathML = function(mathMLstr){
        this.mathML = mathMLstr;
    };

    MathEditor.prototype.setTex = function(texStr){
        this.tex = texStr;
    };

    MathEditor.prototype.renderFromMathML = function(strMath, $target, force){

        if(typeof(MathJax) !== 'undefined'){

            if(this.processing){
                return;
            }

            //strip and wrap math tags to compare and clean it
            strMath = _stripMathTags(strMath);
            if(!force && strMath === this.mathML){
                return;
            }

            strMath = _wrapMathTags(strMath);
            this.$buffer.html(strMath);

            var _this = this;
            MathJax.Hub.Queue(
                ["Typeset", MathJax.Hub, this.$buffer[0]],
                function(){
                    _this.processing = false;
                    $target.html(_this.$buffer.html());
                    _this.mathML = _stripMathTags(strMath);
                }
            );
        }

    };

    MathEditor.prototype.renderFromTex = function(strTeX, $target){

        if(typeof(MathJax) !== 'undefined'){
            var _this = this;
            var jaxQueue = MathJax.Hub.queue;

            if(!_this.texJax && false){
                //programmatically typeset the mathOutput element and fetch the first one
                jaxQueue.Push(
                    ["Typeset", MathJax.Hub, $target[0]],
                    function(){
                        _this.texJax = _getJaxByElement($target);
                        $target.css('visibility', 'hidden');
                    }
                );
            }

            //render preview:
            jaxQueue.Push(
                function(){
                    $target.css('visibility', 'hidden');
                },
                ["Text", _this.texJax, "\\displaystyle{" + strTeX + "}"],
                function(){
                    _this.setTex(strTeX);
                    _this.currentTexToMathML(function(mathML){
                        _this.setMathML(MathEditor.stripMathTags(mathML));
                    });
                },
                function(){
                    $target.css('visibility', 'visible');
                }
            );
        }

    };

    var _stripMathTags = function(mathMLstr){

        mathMLstr = mathMLstr.replace(/<(\/)?math[^>]*>/g, '');
        mathMLstr = mathMLstr.replace(/^\s*[\r\n]/gm, '');//remove first blank line
        mathMLstr = mathMLstr.replace(/\s*[\r\n]$/gm, '');//last blank line

        return mathMLstr;
    };

    var _getJaxByElement = function($element){

        if($element instanceof $ && $element.length){
            var $script = $element.find('script');
            if($script.length && $script[0].MathJax && $script[0].MathJax.elementJax){
                return $script[0].MathJax.elementJax;
            }
        }
    };

    var _wrapMathTags = function(mathMLstr){

        if(!mathMLstr.match(/<math[^>]*>/)){
            var display = (this.display === 'block') ? ' display="block"' : '';
            mathMLstr = '<math' + display + '>' + mathMLstr;//always show preview in block mode
        }
        if(!mathMLstr.match(/<\/math[^>]*>/)){
            mathMLstr += '</math>';
        }

        return mathMLstr;
    };

    MathEditor.prototype.currentTexToMathML = function(callback){

        var _this = this;
        var mathML = '';

        try{
            mathML = _this.texJax.root.toMathML('');
        }catch(err){
            if(!err.restart){
                throw err;
            }
            return MathJax.Callback.After(function(){
                _this.currentTexToMathML(callback);
            }, err.restart);
        }

        MathJax.Callback(callback)(mathML);
    };

    return MathEditor;
});