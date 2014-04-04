define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiXmlRenderer/renderers/Renderer'
], function(_, $,XmlRenderer){

    var tools = {};
    
    var _xmlRenderer = new XmlRenderer({shuffleChoices : false});
    
    tools.listenStateChange = function(){

        $(document).on('beforeStateInit.qti-widget', function(e, element, state){
            console.log('->state : ' + state.name + ' : ' + element.serial);
        });

        $(document).on('afterStateExit.qti-widget', function(e, element, state){
            console.log('<-state : ' + state.name + ' : ' + element.serial);
        });
    };

    tools.liveXmlPreview = function(item, $destination){

        //render qti xml:
        
        _xmlRenderer.load(function(R){
            
            var bufferedExec = _.throttle(function(){
                var rawXml = item.render(_xmlRenderer);
                _printXml(rawXml, $destination);
            }, 200);

            var events = [
                'containerBodyChange',
                'attributeModified.qti-widget',
                'choiceCreated.qti-widget',
                'correctResponseChange.qti-widget',
                'mapEntryChange.qti-widget',
                'mapEntryRemove.qti-widget',
                'deleted.qti-widget',
                'choiceTextChange.qti-widget'
            ];
            
            $(document).on(events.join(' '), bufferedExec);

        }, item.getUsedClasses());

    };

    var _formatXml = function(xml){
        return vkbeautify.xml(xml, '\t');
    };

    var _printXml = function(rawXml, $destination){

        var $code = $(),
            xml = _formatXml(rawXml);

        xml = xml
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        $destination.html(xml);
        
        if($destination.hasClass('language-markup')){
            $code = $destination;
        }else{
            $code = $destination.find('code.language-markup');
            if(!$code.length){
                $code = $('<code>', {'class':'language-markup'});
            }
            $destination.addClass('line-numbers').append($code);
        }
        
        if($code.length){
            Prism.highlightElement($destination[0]);
        }
    };

    return tools;
});