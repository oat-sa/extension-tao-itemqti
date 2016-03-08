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
                '\\frac1 2{',
                '\\begin{align} f(x) & = (a+b)^2 \\\\ & = a^2+2ab+b^2 \\\\ \\end{align}',
                '\\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
                '\\sum_{i=0}^n i^2 = \\frac{(n^2+n)(2n+1)}{6}',
                'A_{m,n} = \\begin{pmatrix} a_{1,1} & a_{1,2} & \\cdots & a_{1,n} \\\\ a_{2,1} & a_{2,2} & \\cdots & a_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m,1} & a_{m,2} & \\cdots & a_{m,n} \\end{pmatrix}'
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
        }, texExprs.length * 750); // we give Mathjax some time to generate the output
    });

});


