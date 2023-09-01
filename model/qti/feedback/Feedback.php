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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\taoQtiItem\model\qti\feedback;

use InvalidArgumentException;
use oat\taoQtiItem\model\qti\IdentifiedElement;
use oat\taoQtiItem\model\qti\container\FlowContainer;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\container\ContainerStatic;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\ContentVariable;
use oat\taoQtiItem\model\qti\attribute\OutcomeIdentifier;
use oat\taoQtiItem\model\qti\attribute\ShowHideTemplateElement;

/**
 * The QTI_Feedback object represent one of the three available feedbackElements
 * (feedbackInline, feedbackBlock, feedbackModal
 *
 * @access public
 * @author Sam Sipasseuth, <sam.sipasseuth@taotesting.com>
 * @package taoQTI
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10243
 */
abstract class Feedback extends IdentifiedElement implements FlowContainer, ContentVariable
{
    protected $body;

    /**
     * Feedback constructor.
     *
     * @param array     $attributes
     * @param Item|null $relatedItem
     * @param string    $serial
     *
     * @throws QtiModelException
     */
    public function __construct($attributes = [], Item $relatedItem = null, $serial = '')
    {
        parent::__construct($attributes, $relatedItem, $serial);
        $this->body = new ContainerStatic('', $relatedItem); //@todo: implement interactive container
    }

    public function getBody()
    {
        return $this->body;
    }

    protected function getUsedAttributes()
    {
        return [
            OutcomeIdentifier::class,
            ShowHideTemplateElement::class
        ];
    }

    /**
     * Check if the given new identifier is valid in the current state of the qti element
     *
     * @param string $newIdentifier
     * @return bool
     * @throws InvalidArgumentException
     */
    public function isIdentifierAvailable($newIdentifier)
    {
        if (empty($newIdentifier) || is_null($newIdentifier)) {
            throw new InvalidArgumentException("newIdentifier must be set");
        }

        if (!empty($this->identifier) && $newIdentifier === $this->identifier) {
            return true;
        }

        $relatedItem = $this->getRelatedItem();

        if (is_null($relatedItem)) {
            return true; // no restriction on identifier since not attached to any qti item
        }

        $collection = $relatedItem->getIdentifiedElements();

        try {
            return null === $collection->getUnique($newIdentifier, self::class);
        } catch (QtiModelException $e) {
        }

        return false;
    }

    public function toArray($filterVariableContent = false, &$filtered = [])
    {
        $data = parent::toArray($filterVariableContent, $filtered);

        if ($filterVariableContent) {
            $filtered[$this->getSerial()] = $data;
            $data = [
                'serial' => $data['serial'],
                'qtiClass' => $data['qtiClass']
            ];
        }

        return $data;
    }

    public function toFilteredArray()
    {
        return $this->toArray(true);
    }
}
