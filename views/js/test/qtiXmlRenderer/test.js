require([
    'jquery',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiXmlRenderer/renderers/Renderer',
    'json!taoQtiItem/test/samples/json/space-shuttle-m.json',
    'json!taoQtiItem/test/samples/json/airports.json',
    'json!taoQtiItem/test/samples/json/edinburgh.json'
], function($, Loader, Element, Renderer, item_shuttle, item_airports, item_edinburgh){

    function minXml(xml){
        return xml
            .replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "")
            .replace(/[ \r\n\t]+xmlns/g, ' xmlns')
            .replace(/[\n\s]+/g, " ")
            .replace(/>[\n\s]?</g, "><")
            .trim();
    }

    var items = [
        {
            data : item_shuttle,
            comment : 'single multichoice',
            xml : '<?xml version="1.0" encoding="UTF-8"?><assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd" identifier="space-shuttle-30-years-of-adventure" title="The Space Shuttle, 30 years of adventure" label="" adaptive="false" timeDependent="false" toolName="TAO" toolVersion="3.0" ><responseDeclaration identifier="RESPONSE" cardinality="multiple" baseType="identifier" ><correctResponse><value><![CDATA[Atlantis]]></value><value><![CDATA[Pathfinder]]></value></correctResponse></responseDeclaration><outcomeDeclaration identifier="SCORE" cardinality="single" baseType="integer" ><defaultValue><value>0</value></defaultValue></outcomeDeclaration><itemBody><p id="stimulus"> During more than 30 years, the American Space Shuttle transported 355 astronauts in space over 135 orbital launchings from Cap Canaveral, Florida. This 2046-ton Behemoth traveled 870 million kilometers around the Earth from 12th of April 1981 to 21st of July 2011. The National Aeronautics and Space Administration (NASA) built 5 Space Shuttles: Columbia, Challenger, Discovery, Atlantis and Endeavour. </p><choiceInteraction responseIdentifier="RESPONSE" shuffle="false" maxChoices="2" minChoices="1" id="interaction" ><prompt >Which was the last Space Shuttle going into space during the STS-135 mission in July 2011?</prompt><simpleChoice identifier="Discovery" fixed="false" >Discovery</simpleChoice><simpleChoice identifier="Challenger" fixed="false" >Challenger</simpleChoice><simpleChoice identifier="Pathfinder" fixed="false" >Pathfinder</simpleChoice><simpleChoice identifier="Atlantis" fixed="false" >Atlantis</simpleChoice><simpleChoice identifier="Endeavour" fixed="false" >Endeavour</simpleChoice></choiceInteraction></itemBody><responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/></assessmentItem>'
        },
        {
            data : item_airports,
            comment : 'graphic interaction',
            xml : '<?xml version="1.0" encoding="UTF-8"?><assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd" identifier="hotspot" title="UK Airports (Take 1)" label="" adaptive="false" timeDependent="false" toolName="TAO" toolVersion="3.0" ><responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier" ><correctResponse><value><![CDATA[A]]></value></correctResponse></responseDeclaration><outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float" /><itemBody><p>The picture illustrates four of the most popular destinations for air travellers arriving in the United Kingdom: London, Manchester, Edinburgh and Glasgow.</p><hotspotInteraction responseIdentifier="RESPONSE" maxChoices="1" minChoices="0" ><prompt >Which one is Glasgow?</prompt><object data="images/ukair.png" type="image/png" width="206" height="280" >UK Map</object><hotspotChoice identifier="A" fixed="false" shape="circle" coords="77,115,8" /><hotspotChoice identifier="B" fixed="false" shape="circle" coords="118,184,8" /><hotspotChoice identifier="C" fixed="false" shape="circle" coords="150,235,8" /><hotspotChoice identifier="D" fixed="false" shape="circle" coords="96,114,8" /></hotspotInteraction></itemBody><responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/></assessmentItem>'
        },
        {
            data : item_edinburgh,
            comment : 'match correct rp + areamapping attributes',
            xml : '<?xml version="1.0" encoding="UTF-8"?><assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd" identifier="selectPoint" title="Where is Edinburgh?" label="" adaptive="false" timeDependent="false" toolName="TAO" toolVersion="3.0" ><responseDeclaration identifier="RESPONSE" cardinality="single" baseType="point" ><correctResponse><value><![CDATA[102 113]]></value></correctResponse><areaMapping defaultValue="0"><areaMapEntry shape="circle" coords="102,113,16" mappedValue="1" /></areaMapping></responseDeclaration><outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float" /><itemBody><selectPointInteraction responseIdentifier="RESPONSE" maxChoices="1" minChoices="0" ><prompt >Mark Edinburgh on this map of the United Kingdom.</prompt><object data="images/uk.png" type="image/png" width="196" height="280" >UK Map</object></selectPointInteraction></itemBody><responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response_point"/></assessmentItem>'
        }
    ];
    
    QUnit
        .cases(items)
        .asyncTest('xml rendering', function(sample, assert){
        
        var loader = new Loader(),
            renderer = new Renderer({
                shuffleChoices : false,
                runtimeContext : {
                    runtime_base_www : '/taoQtiItem/test/samples/test_base_www/',
                    root_url : '',
                    debug : true
                }
            });
            
            loader.loadItemData(sample.data, function(item){

                assert.ok(Element.isA(item, 'assessmentItem'), sample.data.identifier + ' item loaded');

                renderer.load(function(){

                    QUnit.start();
                    
                    item.setRenderer(renderer);
                    var xml = item.render();
                    xml = minXml(xml);
                    assert.equal(xml, sample.xml, 'xml equals '+ sample.comment);

                }, this.getLoadedClasses());

            });
        
    });
    
});