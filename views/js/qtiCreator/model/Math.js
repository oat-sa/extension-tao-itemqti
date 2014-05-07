define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Math'
], function(_, editable, Math){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {};
        },
        afterCreate : function(){
            this.setAnnotation('latex', 'a^2 + b^2 = c^2');
            this.setMathML('<mstyle><mrow><msup><mi>a</mi><mn>2</mn></msup><mo>+</mo><msup><mi>b</mi><mn>2</mn></msup><mo>=</mo><msup><mi>c</mi><mn>2</mn></msup></mrow></mstyle>');
        }
    });
    return Math.extend(methods);
});