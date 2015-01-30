define(['taoQtiItem/qtiXmlRenderer/renderers/Renderer'], function(XmlRenderer){

    var _xmlRenderer = new XmlRenderer({shuffleChoices : false}).load();

    var _render = function(item){
        var xml = item.render(_xmlRenderer);
        return xml;
    };

    return {
        render : _render,
        get : function(){
            return _xmlRenderer;
        }
    };
});