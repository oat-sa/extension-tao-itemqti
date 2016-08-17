<?php

namespace oat\taoQtiItem\scripts;

use oat\taoQtiItem\model\event\ItemCreatorLoad;

class PortableReloadEventListener
{
    public static function reloadPortableDevDirectory(ItemCreatorLoad $event)
    {
        \common_Logger::w(' HELLO WORLD ');
    }
}