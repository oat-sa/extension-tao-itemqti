define(['taoQtiItem/qtiItem/core/choices/Choice'], function(QtiChoice){

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
        text : function(text){
            return this.val(text);
        },
        render : function(data, $container, tplName){
            var data = {
                body : this.text
            };
            return this._super(data, $container, tplName);
        }
    });

    return QtiTextVariableChoice;
});


