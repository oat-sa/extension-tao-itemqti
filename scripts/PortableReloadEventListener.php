<?php

namespace oat\taoQtiItem\scripts;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\event\ItemCreatorLoad;
use oat\taoQtiItem\model\portableElement\PortableElementService;

class PortableReloadEventListener
{

    /**
     * Re-register a portable element from its source directory
     * The list of portable elements to re-register is configure in the config file {TAO_ROOT}/config/taoQtiItem/debug_portable_element.conf.php
     * e.g.
        return [
            'myPci1' => 'qtiItemPci/views/js/pciCreator/dev/myPci1/',
            'myPci2' => '/home/sam/dev/pcis/myPci2/'
        ];
     *
     * @param ItemCreatorLoad $event
     * @throws \common_Exception
     * @throws \common_ext_ExtensionException
     */
    public static function reloadPortableDevDirectory(ItemCreatorLoad $event)
    {
        $customInteractionDirs = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getConfig('debug_portable_element');
        if(is_array($customInteractionDirs)){
            $service = new PortableElementService();
            $service->setServiceLocator(ServiceManager::getServiceManager());
            foreach($customInteractionDirs as $path){
                if(is_dir(ROOT_PATH.$path)){
                    $sourceDir = ROOT_PATH.$path;
                }else if(is_dir($path)){
                    $sourceDir = $path;
                }else{
                    throw new \common_Exception('No directory found on path '.$path);
                }
                $service->registerFromDirectorySource($sourceDir);
                \common_Logger::i('Re-registered portable element from the source '.$sourceDir);
            }
        }
    }
}