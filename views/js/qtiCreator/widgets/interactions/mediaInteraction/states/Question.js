define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/media',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction',
    'helpers',
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
                MediaInteractionCommonRenderer.theRender(interaction, true);
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
            interaction = _widget.element;

        //initialization binding
        //initialize your form here, you certainly gonna need to modify it:
        //append the form to the dom (this part should be almost ok)
        $form.html(formTpl({
            
            //tpl data for the interaction
            autostart : !!interaction.attr('autostart'),
            loop : !!interaction.attr('loop'),
            minPlays : parseInt(interaction.attr('minPlays')),
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
        callbacks['width'] = formElement.getAttributeChangeCallback();
        callbacks['height'] = formElement.getAttributeChangeCallback();
        callbacks['data'] = formElement.getAttributeChangeCallback();
        /*callbacks['data'] = function(interaction, attrValue, attrName){
            //some callback method when the input has been validated
            
            //something like:
            interaction.attr(attrName, attrValue);
        };*/
        //and so on for the other attributes...
        
        formElement.initDataBinding($form, interaction, callbacks);
        
        _widget.on('attributeChange', function(data){
            //if the template changes, forward the modification to a helper
            //answerStateHelper.forward(_widget);
            //console.log(data);
               
        });
         
         
        var selectMediaButton = $(_widget.$form).find(".selectMediaFile");
        selectMediaButton.on('click', function() {
            $(this).resourcemgr({
                root        : '/',
                browseUrl   : helpers._url('files', 'ItemContent', 'taoItems'),
                uploadUrl   : helpers._url('upload', 'ItemContent', 'taoItems'),
                deleteUrl   : helpers._url('delete', 'ItemContent', 'taoItems'),
                downloadUrl : helpers._url('download', 'ItemContent', 'taoItems'),
                params : {
                    filters : null,
                    uri : null,
                    lang : 'en-US'
                },
                pathParam : 'path',
                create : function(e){
                    console.log('created');
                },
                open : function(e){
                    console.log('opened');
                },
                close : function(e){
                    console.log('closed');
                },
                select : function(e, files){
                    console.log( files );
                }
            });
        });
        
    };

    return MediaInteractionStateQuestion;
});