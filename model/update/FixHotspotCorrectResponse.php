<?php
/**
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

use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\interaction\GraphicGapMatchInteraction;

/**
 * Description of FixHotspotCorrectResponse
 *
 * @author Aleh Hutnikau, <hutnkau@1pt.com>
 */
class FixHotspotCorrectResponse extends ItemUpdater
{

    /**
     * Set correct order of identifiers in correct response
     *
     * @param Item $item
     * @param string $itemFile
     * @return boolean
     */
    protected function updateItem(Item $item, $itemFile)
    {
        $interactions = $item->getInteractions();
        $graphicGapMatchInteractions = array_filter($interactions, function ($interaction) {
            return $interaction->getQtiTag() === 'graphicGapMatchInteraction';
        });
        $updated = false;

        if (!empty($graphicGapMatchInteractions)) {
            foreach ($graphicGapMatchInteractions as $graphicGapMatchInteraction) {
                $updated = $updated || $this->fixCorrectResponse($graphicGapMatchInteraction);
            }
        }

        return $updated;
    }

    /**
     * @param GraphicGapMatchInteraction $interaction
     * @return boolean;
     */
    private function fixCorrectResponse(GraphicGapMatchInteraction $interaction)
    {
        $updated = false;

        $gapImgs = $interaction->getGapImgs();
        $gapImgIds = array_values(array_map(function($gapImg) {
            return $gapImg->getIdentifier();
        }, $gapImgs));

        $associableHotspots = $interaction->getChoices();
        $associableHotspotIds = array_values(array_map(function($associableHotspot) {
            return $associableHotspot->getIdentifier();
        }, $associableHotspots));

        $correctResponses = $interaction->getResponse()->getCorrectResponses();
        foreach ($correctResponses as $correctResponse) {
            /** @var \oat\taoQtiItem\model\qti\Value $correctResponse*/
            $val = $correctResponse->getValue();
            $valParts = explode(' ', $val);

            if (in_array($valParts[1], $gapImgIds) && in_array($valParts[0], $associableHotspotIds)) {
                $correctResponse->setValue($valParts[1] . ' ' . $valParts[0]);
                $updated = true;
            }

        }

        return $updated;
    }
}