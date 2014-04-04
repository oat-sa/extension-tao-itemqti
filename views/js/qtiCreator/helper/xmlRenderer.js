define(['taoQtiItem/qtiXmlRenderer/renderers/Renderer'], function(XmlRenderer) {

    var _xmlRenderer = new XmlRenderer({shuffleChoices: false}).load();

    var _render = function(item) {
        return item.render(_xmlRenderer);
    };

    return {
        render: _render
    };
});