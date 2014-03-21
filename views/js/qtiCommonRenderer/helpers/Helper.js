define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCommonRenderer/helpers/Instruction',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/notification',
], function(_, $, Instruction, notifTpl){

    var _containers = {};
    var _instructions = {};

    return {
        getContainer : function(element){
            var serial = element.getSerial();
            if(!_containers[serial]){
                _containers[serial] = $('[data-serial=' + serial + ']');
            }
            return _containers[serial];
        },
        validateInstructions : function(element, data){
            var serial = element.getSerial();
            if(_instructions[serial]){
                _.each(_instructions[serial], function(instruction){
                    instruction.validate(data);
                });
            }
        },
        appendInstruction : function(element, message, validateCallback){
            var serial = element.getSerial(),
                instruction = new Instruction(element, message, validateCallback);

            if(!_instructions[serial]){
                _instructions[serial] = {};
            }
            _instructions[serial][instruction.getId()] = instruction;

            instruction.create(this.getContainer(element).find('.instruction-container'));

            return instruction;
        },
        removeInstructions : function(element){
            _instructions[element.getSerial()] = {};
            this.getContainer(element).find('.instruction-container').empty();
        },
        appendNotification : function(element, message, level){

            level = level || 'info';

            if(Instruction.isValidLevel(level)){

                var $container = this.getContainer(element);

                $container.find('.notification-container').prepend(notifTpl({
                    'level' : level,
                    'message' : message
                }));

                var $notif = $container.find('.item-notification:first');
                var _remove = function(){
                    $notif.fadeOut();
                };

                $notif.find('.close-trigger').on('click', _remove);
                setTimeout(_remove, 2000);

                return $notif;
            }
        },
        removeNotifications : function(element){
            this.getContainer(element).find('.item-notification').remove();
        },
        triggerResponseChangeEvent : function(interaction, extraData){
            this.getContainer(interaction).trigger('responseChange', [{
                    interaction : interaction,
                    response : interaction.getResponse()
                },
                extraData
            ]);
        }
    };
});