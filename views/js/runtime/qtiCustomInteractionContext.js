define(['jquery'], function($){

    var _interactions = {};

    var taoQtiCustomInteractionContext = {
        /**
         * register a custom interaction (its runtime model) in blobal registery
         * register a renderer
         * 
         * @param {Object} qtiHook
         * @returns {undefined}
         */
        register : function(qtiHook){
            _interactions[qtiHook.getTypeIdentifier()] = qtiHook;
        },
        /**
         * notify when a custom interaction is ready for user interaction
         * 
         * @param {string} hook_id
         * @fires custominteractionready
         */
        notifyReady : function(hook_id){

        },
        /**
         * notify when a custom interaction is completed by user
         * 
         * @param {string} hook_id
         * @fires custominteractiondone
         */
        notifyDone : function(hook_id){

        },
        getRenderer : function(interactionType){
            return _interactions[interactionType] || null;
        }
    };

    var qtiCustomInteractionContext = {
        // A field holding the interactions registered during initialization.
        interactions : new Array(),
        // The HTML element housing the custom interactions.
        htmlNodes : new Array(),
        // The custom interaction configuration data.
        configurations : new Array(),
        // The registration method is used for a loaded interaction to register with
        // the global context. This method is called by all custom interactions during
        // the loading of the JavaScript implementation.
        register : function(qtiHook){
            // Simple log message allowing developers to view what custom interactions
            // registered.
            console.log('registering hook:' + qtiHook.getTypeIdentifier());
            // The interaction is added to the interactions field for further processing.
            this.interactions.push(qtiHook);
        },
        // Setting a configuration for a custom interaction is optional. The configuration
        // is custom interaction specific. By calling this method consecutive times the
        // configuration will be overwritten. The id matches the HTML element id defined in
        // the item definition.
        setConfiguration : function(id, configuration){
            // if a configuration already exists for an interaction id merge the new
            // configuration with the old configuration.
            if(this.configurations[id]){
                // JQuery object merging is applied to the configurations in this
                // example.
                $.extend(this.configurations[id], configuration);
            }else{
                // The configuration is recorded in the configurations field for later
                // use.
                this.configurations[id] = configuration;
            }
        },
        // Custom interactions may retrieve configuration information specifically for the
        // instance of an executing custom interaction. The id matches the HTML element id
        // defined in the item definition.
        getConfiguration : function(id){
            // The configurations field is accessed to return a custom interaction
            // defined configuration.
            return this.configurations[id];
        },
        // This method is called by the rendering engine to initialize all custom
        // interactions. During initialization, the custom interaction is identified
        // by the type identifier defined in the class attribute of the HTML element.
        initialize : function(){
            // A check field used to verify multiple custom interactions of the same
            // type are created and initialized once.
            var typeIdMap = new Object();

            // Iterates over registered interactions.
            for(var i = 0; i < this.interactions.length; i++){
                // The interaction to processes.
                var interaction = this.interactions[i];
                // The local field is used to verify multiple custom interactions
                // of the same type are created and initialized once.
                if(typeIdMap[interaction.getTypeIdentifier()]){
                    continue;
                }
                // The custom interaction type identifier is used to access all HTML
                // elements with the class attribute.
                var list = document.getElementsByClassName(interaction.getTypeIdentifier());
                // The HTML element id is used to link the custom interaction with
                // further communication with the custom interaction instance.
                var id = list[0].id;
                // The custom interaction instance is added as an object attribute
                // to the htmlNodes field.
                this.htmlNodes[id] = list[0];
                // The custom interaction instance is added as an object attribute
                // to the interactions field.
                this.interactions[id] = interaction;
                // The interaction type is added to the local field to ensure custom
                // interactions of the same type are not processed multiple times.
                typeIdMap[interaction.getTypeIdentifier()] = 1;
                // The custom interaction initialize method is called with the HTML
                // element and item defined id.
                interaction.initialize(id, list[0]);

                // If there are multiple interactions of the same type defined in
                // the item they will be initialized with a cloned hook instance.
                for(var x = 1; x < list.length; x++){
                    // JQuery is used to clone an interaction hook.
                    var copy = $.extend({}, interaction);
                    // The HTML element id is used as the interaction instance
                    // identifier.
                    var copy_id = list[x].id;
                    // The custom interaction instance is added as an object
                    // attribute to the interactions field.
                    this.interactions[copy_id] = copy;
                    // The HTML element is recorded in the htmlNodes field.
                    this.htmlNodes[copy_id] = list[x];
                    // The custom interaction instance is initialized. With the
                    // HTML element id and HTML element.
                    copy.initialize(copy_id, list[x]);
                }
            }
        },
        // notifyReady must be called by a custom interaction hook to inform the system an
        // interaction is ready for use.
        notifyReady : function(hook_id){
            // A simple log message informs developers of the activity. This may be used
            // by a delivery system to hide a loading widget covering a custom
            // interaction instance.
            console.log('Interaction Ready:' + hook_id + '-'
                + this.interactions[hook_id].getTypeIdentifier());
        },
        // notifyDone is optionally called by a custom interaction. The method exists in
        // the event a custom interaction has an indeterminate end.
        notifyDone : function(hook_id){
            // A simple log message informs developers of the activity.
            console.log('Finished interaction:' + hook_id + '-'
                + this.interactions[hook_id].getTypeIdentifier());
        }
    };

    return taoQtiCustomInteractionContext;
});