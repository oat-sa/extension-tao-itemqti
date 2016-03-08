define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/MathEditor',
    'mathJax'
],
function($, MathEditor) {
    "use strict";

    QUnit.asyncTest('Latex rendering', function test(assert) {
        var texExprs = [
                '\\fr<ac1 2{',
                '\\frac1 2{'
            ],
            displayType = [
                'block',
                'other'
            ],

            $bufferContainer = $('.mj-buffer'),
            $targetContainer = $('.mj-target');

        QUnit.expect(texExprs.length * displayType.length);

        texExprs.forEach(function generateMathJaxOutput(texExpr, index) {
            displayType.forEach(function loopDisplay(display) {
                var key = display + '-' + index,
                    $buffer = $('<div class="mj-buffer-' + key + '"></div>'),
                    $target = $('<div class="mj-target-' + key + '"></div>'),

                    mathEditor = new MathEditor({
                        buffer: $buffer,
                        target: $target,
                        display: display
                    });

                $bufferContainer.append($buffer);
                $targetContainer.append($target);

                mathEditor.setTex(texExpr);
                mathEditor.renderFromTex();
            });
        });

        setTimeout(function checkMathJaxOutput() {
            QUnit.start();

            texExprs.forEach(function checkForExpression(texExpr, index) {
                displayType.forEach(function loopDisplay(display) {
                    var $target = $targetContainer.find('.mj-target-' + display + '-' + index),
                        actualScript = $target.find('script').text(),
                        expectedScript = '\\displaystyle{' + texExpr + '}';

                    assert.ok(actualScript === expectedScript,
                        'Error in Mathjax output: expected ' + expectedScript + ' but was ' + actualScript);
                });
            });
        }, 1500); // we give Mathjax some time to generate the output
    });

});


