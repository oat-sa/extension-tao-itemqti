define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/MathEditor'
],
function($, MathEditor) {
    'use strict';

    QUnit.module('Mathjax latex rendering');

    var texExprs = [
            { title: 'short expr', input: '\\frac1 2' },
            { title: 'broken expr that use to lock the editor', input: '\\fr<ac1 2' },
            { title: 'simple expr', input: '\\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
            { title: 'medium expr 1', input: '\\sum_{i=0}^n i^2 = \\frac{(n^2+n)(2n+1)}{6}' },
            { title: 'medium expr 2', input: '\\begin{align} f(x) & = (a+b)^2 \\\\ & = a^2+2ab+b^2 \\\\ \\end{align}' },
            { title: 'complex expr', input: 'A_{m,n} = \\begin{pmatrix} a_{1,1} & a_{1,2} & \\cdots & a_{1,n} \\\\ a_{2,1} & a_{2,2} & ' +
                '\\cdots & a_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m,1} & a_{m,2} & ' +
                '\\cdots & a_{m,n} \\end{pmatrix}' }
        ],
        displayTypes = [
            { title: ' with display = block', display: 'block' },
            { title: ' with display = other', display: 'other' }
        ];

    QUnit
        .cases(texExprs)
        .combinatorial(displayTypes)
        .asyncTest('Latex rendering', 1, function test(data, assert) {

        var
            key = Date.now(), // we give a unique key for each test case as Mathjax needs some time to render

            $bufferContainer = $('.mj-buffer'),
            $targetContainer = $('.mj-target');
        //texExprs.forEach(function generateMathJaxOutput(texExpr, index) {
        //    displayType.forEach(function loopDisplay(display) {
            var $buffer = $('<div class="mj-buffer-' + key + '"></div>'),
                $target = $('<div class="mj-target-' + key + '"></div>'),

                mathEditor = new MathEditor({
                    buffer: $buffer,
                    target: $target,
                    display: data.display
                });

            $bufferContainer.append($buffer);
            $targetContainer.append($target);

            mathEditor.setTex(data.input);
            mathEditor.renderFromTex();
            //});
        //});
        setTimeout(function checkMathJaxOutput() {
            QUnit.start();

            //texExprs.forEach(function checkForExpression(texExpr, index) {
            //    displayType.forEach(function loopDisplay(display) {
                    var $target = $targetContainer.find('.mj-target-' + key),
                        actualScript = $target.find('script').text(),
                        expectedScript = '\\displaystyle{' + data.input + '}';

                    assert.ok(actualScript === expectedScript,
                        'Error in Mathjax output: expected ' + expectedScript + ' but was ' + actualScript);
                //});
            //});
        }, 750); // we give Mathjax some time to generate the output
    });

});


