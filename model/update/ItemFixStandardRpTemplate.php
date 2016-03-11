<?php
/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiItem\model\update;

/**
 * Description of ItemFixStandardRpTemplate
 *
 * @author sam
 */
class ItemFixStandardRpTemplate extends ItemUpdater
{

    /**
     * Check if the item has an inccorect response processing type
     * Itf it is the case, tag it as requiring change and the method toXML() will render the xml correctly in this situation
     *
     * @param oat\taoQtiItem\modal\Item $item
     * @return boolean
     */
    protected function updateItem(\oat\taoQtiItem\model\qti\Item $item)
    {
        $changed = false;
        $interactions = $item->getInteractions();
        $rp = $item->getResponseProcessing();
        if($rp instanceof \oat\taoQtiItem\model\qti\response\TemplatesDriven){
            if(count($interactions) > 1){
                $changed = true;
            }else{
                $interaction = reset($interactions);
                if($interaction && $interaction->attr('responseIdentifier') != 'RESPONSE'){
                    $changed = true;
                }
            }
        }
        return $changed;
    }
}