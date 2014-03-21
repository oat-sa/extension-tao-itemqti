define([
    'jquery',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/core/model/qtiClasses',
    'taoQtiItem/qtiCreator/renderers/Renderer',
    'taoQtiItem/qtiXmlRenderer/renderers/Renderer',
    'json!taoQtiItem/qtiItem/../../../test/samples/json/ALL.json'
], function($, Loader, Element, qtiClasses, Renderer, XmlRenderer, data){

    var bufferedExecution = function(bufferTime, callback){
        var scheduled,
            lastOutput = 0,
            exec = function (){
                lastOutput = new Date().getTime();
                scheduled = false;
                callback();
            };

        return {
            exec : function(){
                if(scheduled){
                    return;
                }

                var diff = (new Date()).getTime() - lastOutput;

                if(diff < bufferTime){
                    scheduled = setTimeout(exec, bufferTime - diff);
                }else{
                    exec();
                }

            },
            reset : function(){
                if(scheduled){
                    clearTimeout(scheduled);
                }
                scheduled = lastOutput = 0;
            }
        };
    };

    var formatXml = function(xml){
        return vkbeautify.xml(xml, '\t');
    };

    var printXml = function(rawXml){

        var xml = formatXml(rawXml);

        xml = xml
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        var $code = $('#xml-container').html(xml);
        Prism.highlightElement($code[0]);

    };

    var Test = {
        testRender : function(itemIdentifier, attributes){

            if(data[itemIdentifier]){

                test('render', function(){

                    var loader = new Loader().setClassesLocation(qtiClasses);

                    stop();//wait for the next start()

                    loader.loadItemData(data[itemIdentifier].full, function(item){
                        
                        ok(Element.isA(item, 'assessmentItem'), itemIdentifier + ' item loaded');

                        //count interaction number:
                        var interactions = item.getInteractions();
                        ok(interactions.length, 'has ' + interactions.length + ' interaction(s)');

                        //test only the last interaction:
                        var interaction = interactions.pop();
                        interaction.attr(attributes);//overwrite attributes for test purpose:

                        //append item placeholder and render it:
                        var $placeholder = $('<div>', {id : 'qtiItem-' + item.id()});
                        $('#item-editor-panel h1').text('item identifier : ' + item.id())
                        $("#item-editor-panel #interaction").append($placeholder);

                        var $interactionForm = $('<div>', {'id' : 'qtiCreator-form-interaction', 'class': 'form-container', text : 'interaction form place holder'});
                        var $choiceForm = $('<div>', {'id' : 'qtiCreator-form-choice', 'class': 'form-container', text : 'choice form place holder'});
                        var $responseForm = $('<div>', {'id' : 'qtiCreator-form-response', 'class': 'form-container', text : 'response form place holder'});
                        $('#form-container')
                            .append($interactionForm)
                            .append($choiceForm)
                            .append($responseForm);

                        var creatorRenderer = new Renderer({
                            shuffleChoices:false,
                            runtimeContext : {
                                runtime_base_www : '/taoQtiItem/test/samples/test_base_www/',
                                root_url : '',
                                debug : true
                            },
                            interactionOptionForm : $interactionForm,
                            choiceOptionForm : $choiceForm,
                            responseOptionForm : $responseForm
                        });

                        creatorRenderer.load(function(){

                            start();

                            item.setRenderer(this);
                            item.render({}, $placeholder);

                            //check item container:
                            ok(item.getContainer().length, 'rendered container found');

                            item.postRender();

                        }, this.getLoadedClasses());
                        
                        $(document).on('beforeStateInit.qti-widget', function(e, element, state){
                            console.log('->state : '+state.name+' : '+element.serial);
                        });
                        
                        $(document).on('afterStateExit.qti-widget', function(e, element, state){
                            console.log('<-state : '+state.name+' : '+element.serial);
                        });

                        //render qti xml:
                        var xmlRenderer = new XmlRenderer({shuffleChoices:false});
                        xmlRenderer.load(function(){
                            var bufferedExec = bufferedExecution(200, function(){
                                item.setRenderer(xmlRenderer);
                                printXml(item.render());
                                item.setRenderer(creatorRenderer);
                            });
                            
                            var events = [
                                'containerBodyChange',
                                'attributeModified.qti-widget',
                                'choiceCreated.qti-widget',
                                'correctResponseChange.qti-widget',
                                'mapEntryChange.qti-widget',
                                'mapEntryRemove.qti-widget',
                                'deleted.qti-widget'
                            ];
                            
                            $(document).on(events.join(' '), function(e, data){
                                bufferedExec.exec();
                            });
                            
                        }, this.getLoadedClasses());


                    });


                });

            }else{
                throw new Error('item sample not found : ' + itemIdentifier);
            }

        }
    };

    return Test;
});