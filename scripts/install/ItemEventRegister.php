<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace oat\taoQtiItem\scripts\install;

/**
 * Description of ItemEventRegister
 *
 * @author Christophe GARCIA <christopheg@taotesting.com>
 */
class ItemEventRegister  extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
    
        $this->registerEvent(\oat\taoItems\model\event\ItemRdfUpdatedEvent::class, 
                array(\oat\taoQtiItem\model\Listener\ItemUpdater::class, 'catchItemRdfUpdatedEvent')
            );
        
    }
}
