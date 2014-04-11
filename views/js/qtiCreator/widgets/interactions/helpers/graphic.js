define([
    'jquery', 
    'tpl!taoQtiItem/qtiCreator/tpl/graphicInteraction/sidebar'
], function($, sidebarTmpl){

    return {
        
        createSideBar : function($container){
            $container.find('.main-image-box').before(sidebarTmpl());
        }

    };
});
