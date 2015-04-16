define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/Include',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCreator/widgets/static/include/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/include'
], function(_, Renderer, containerHelper, Widget, tpl){

    var CreatorImg = _.clone(Renderer);
    
    CreatorImg.template = tpl;
    
    CreatorImg.getContainer = containerHelper.get;
    
    CreatorImg.render = function(include, options){
        
        options = options || {};
        options.baseUrl = this.getOption('baseUrl');
        options.uri = this.getOption('uri');
        options.lang = this.getOption('lang');
        options.mediaManager = this.getOption('mediaManager');
        
        return Widget.build(
            include,
            containerHelper.get(include),
            this.getOption('bodyElementOptionForm'),
            options
        );
    };

    return CreatorImg;
});