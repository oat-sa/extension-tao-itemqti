<?php

namespace oat\taoQtiItem\scripts;

use oat\oatbox\action\Action;
use oat\oatbox\event\EventManager;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\taoQtiItem\model\event\ItemCreatorLoad;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class initEventCreatorLoad implements Action, ServiceLocatorAwareInterface
{
    use EventManagerAwareTrait;
    use ServiceLocatorAwareTrait;

    public function __invoke($params)
    {
        $this->getEventManager()->attach(
            ItemCreatorLoad::class,
            [PortableReloadEventListener::class, 'reloadPortableDevDirectory']
        );
        $this->getServiceLocator()->register(EventManager::CONFIG_ID, $this->getEventManager());

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS);
    }
}
