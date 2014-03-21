define(['taoQtiItem/core/choices/ContainerChoice'], function(QtiContainerChoice){

    var QtiSimpleChoice = QtiContainerChoice.extend({
        qtiClass : 'simpleChoice',
        render : function(data, $container, tplName){
            //@todo use getData() to pass the template var "unique"
            return this._super(_.merge({'unique' : (parseInt(data.interaction.attributes.maxChoices) === 1)}, data || {}), $container, tplName);
        }
    });

    return QtiSimpleChoice;

});


