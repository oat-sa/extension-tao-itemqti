define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/MathEditor',
    'mathJax'
],
function($, MathEditor, MathJax) {
    "use strict";

    QUnit.asyncTest('Latex rendering', function test(assert) {
        var $bufferContainer = $('.mj-buffer'),
            $targetContainer = $('.mj-target'),

            texExprs = [
                '\\fr<ac1 2{',
                '\\frac1 2{'
            ];

        QUnit.expect(texExprs.length);

        texExprs.forEach(function generateMathJaxOutput(texExpr, index) {
            var $buffer = $('<div class="mj-buffer-' + index + '"></div>'),
                $target = $('<div class="mj-target-' + index + '"></div>'),

                mathEditor = new MathEditor({
                    buffer: $buffer,
                    target: $target,
                    display: 'block',
                    tex: texExpr
                });

            $bufferContainer.append($buffer);
            $targetContainer.append($target);

            mathEditor.renderFromTex();
        });


        // in we want to log into the error handler...
        //MathJax.Hub.Register.MessageHook("TeX Jax - parse error", function (message) {
        //    console.log('============ message = ' + message);
        //});

        setTimeout(function checkMathJaxOutput() {
            QUnit.start();

            texExprs.forEach(function checkForExpression(texExpr, index) {
                var $target = $targetContainer.find('.mj-target-' + index),
                    actualScript = $target.find('script').text(),
                    expectedScript = '\\displaystyle{' + texExpr + '}';

                console.log('$target = ' + JSON.stringify($target, null, 2));

                assert.ok(actualScript === expectedScript,
                    'Error in Mathjax output: expected ' + expectedScript + ' but was ' + actualScript);
            });
        }, 1500); // we give Mathjax some time to generate the output
    });

});


