define(['taoQtiItem/core/choices/Choice'], function(QtiChoice){
    
    var QtiTextVariableChoice = QtiChoice.extend({
        init : function(serial, attributes, text){
            this._super(serial, attributes);
            this.val(text || '');
        },
        is : function(qtiClass){
            return (qtiClass === 'textVariableChoice') || this._super(qtiClass);
        },
        val : function(text){
            if(typeof text === 'undefined'){
                return this.text;
            }else{
                if(typeof text === 'string'){
                    this.text = text;
                }else{
                    throw 'text must be a string';
                }
            }
        },
        render : function(data, $container, tplName){
            var data = {
                'body' : this.text
            };
            return this._super(data, $container, tplName);
        }
    });
    
    return QtiTextVariableChoice;
});


