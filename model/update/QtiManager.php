<?php
/**
 * Created by Antoine on 04/02/2016
 * at 13:52
 */

namespace oat\taoQtiItem\model\update;


use oat\oatbox\event\Event;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\media\MediaRendererInterface;
use oat\taoQtiItem\model\sharedStimulus\SharedStimulusRenderer;

class QtiManager
{

    public static function catchEvent(Event $event){
        if ($event instanceof \common_ext_event_ExtensionInstalled) {
            if($event->getExtension()->getName() === 'taoMediaManager'){
                $mediaRenderer = new SharedStimulusRenderer();
                ServiceManager::getServiceManager()->register(MediaRendererInterface::SERVICE_ID, $mediaRenderer);

                $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoMediaManager');

                $config = ($extension->hasConfig('importHandlers'))?$extension->getConfig('importHandlers'):array();
                $extension->setConfig('importHandlers', array_merge($config, array('oat\taoQtiItem\model\sharedStimulus\SharedStimulusImporter')));

                ServiceManager::getServiceManager()->register(MediaRendererInterface::SERVICE_ID, $mediaRenderer);
            }
        }
    }

}