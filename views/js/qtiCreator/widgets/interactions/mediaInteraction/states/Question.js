define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/media',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction',
    'ui/resourcemgr'
], function(stateFactory, Question, formElement, formTpl, MediaInteractionCommonRenderer, helpers) {
    
    var MediaInteractionStateQuestion = stateFactory.extend(Question,
        function() {
            // enter question state
            var _widget = this.widget,
                interaction = _widget.element;
            //_widget.$container.find('[data-state=question]').html('Preview');
            //_widget.$container.find('[data-state=answer]').html('Media settings');
            
            if ( _widget.$container.find('.instruction-container .mejs-container').length == 0 ) {
                //MediaInteractionCommonRenderer.theRender(interaction, true);
                MediaInteractionCommonRenderer.render(interaction, true);
            }
        },
        function() {
            // exit question state
            var _widget = this.widget,
                interaction = _widget.element;
            //_widget.$container.find('.instruction-container').css('display', 'block');
            //_widget.$container.find('.mediadata-container').css('display', 'none');
            //_widget.pause();
        }
    );

    MediaInteractionStateQuestion.prototype.initForm = function(){
        
        var _widget = this.widget,
            $form = _widget.$form,
            options = _widget.options,
            interaction = _widget.element;

        //initialization binding
        //initialize your form here, you certainly gonna need to modify it:
        //append the form to the dom (this part should be almost ok)
        $form.html(formTpl({
            
            //tpl data for the interaction
            autostart : !!interaction.attr('autostart'),
            loop : !!interaction.attr('loop'),
            //minPlays : parseInt(interaction.attr('minPlays')),
            maxPlays : parseInt(interaction.attr('maxPlays')),
            
            //tpl data for the "object", this part is going to be reused by the "objectWidget", http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10173
            data:interaction.object.attr('data'),
            type:interaction.object.attr('type'),//use the same as the uploadInteraction, contact jerome@taotesting.com for this
            width:interaction.object.attr('width'),
            height:interaction.object.attr('height')
        }));

        formElement.initWidget($form);
        
        //init data change callbacks
        //var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'minPlays', 'maxPlays');
        var callbacks = [];
        callbacks['autostart'] = formElement.getAttributeChangeCallback();
        callbacks['loop'] = formElement.getAttributeChangeCallback();
        callbacks['maxPlays'] = formElement.getAttributeChangeCallback();
        
        //callbacks['width'] = formElement.getAttributeChangeCallback();
        callbacks['width'] = function(interaction, attrValue, attrName){
            interaction.object.attr(attrName, attrValue);
            interaction.attr( 'responseIdentifier', interaction.attr('responseIdentifier') ); // xml update cheat
        }
        
        callbacks['height'] = function(interaction, attrValue, attrName){
            interaction.object.attr(attrName, attrValue);
            interaction.attr( 'responseIdentifier', interaction.attr('responseIdentifier') ); // xml update cheat
        }
        
        callbacks['data'] = function(interaction, attrValue, attrName){
            interaction.object.attr(attrName, attrValue);
            interaction.attr( 'responseIdentifier', interaction.attr('responseIdentifier') ); // xml update cheat
        };
        //and so on for the other attributes...
        
        formElement.initDataBinding($form, interaction, callbacks);
        
        _widget.on('attributeChange', function(data){
            //if the template changes, forward the modification to a helper
            //answerStateHelper.forward(_widget);
            console.log(data);
            //debugger;
            
        });
         
         
        var selectMediaButton = $(_widget.$form).find(".selectMediaFile");
        selectMediaButton.on('click', function() {
            
            console.log( $form );
            console.log( $form.find('input[name=data]') );
            
            $(this).resourcemgr({
                appendContainer : options.mediaManager.appendContainer,
                root : '/',
                browseUrl : options.mediaManager.browseUrl,
                uploadUrl : options.mediaManager.uploadUrl,
                deleteUrl : options.mediaManager.deleteUrl,
                downloadUrl : options.mediaManager.downloadUrl,
                params : {
                    uri : options.uri,
                    lang : options.lang,
                    //filters : 'image/jpeg,image/png,image/gif'
                    filters : 'video/mp4,audio/mp3'
                },
                pathParam : 'path',
                select : function(e, files){
                    if(files.length > 0){ 
                        console.log(files, files[0].file, files[0].mime);
                        // set data field content and meybe detect and set media type here
                        var dataInput = $($form.find('input[name=data]'));
                        dataInput.val( files[0].file );
                        dataInput.trigger('change');
                        interaction.object.attr('type', files[0].mime);
                        console.log(interaction, options.baseUrl+files[0].file );
                    }
                }
            });
        });
        
    };

    return MediaInteractionStateQuestion;
});