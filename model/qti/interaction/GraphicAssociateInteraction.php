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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2013-2026 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\qti\interaction;

use common_Logger;
use oat\taoQtiItem\model\qti\Item;

/**
 * QTI Graphic Associate Interaction
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10370
 */
class GraphicAssociateInteraction extends GraphicInteraction
{
    private const ARROW_MODE = 'arrow';
    private const DIRECT_PAIR = 'directedPair';
    private const PAIR = 'pair';

    public function __construct($attributes = [], Item $relatedItem = null, $serial = '')
    {
        parent::__construct($attributes, $relatedItem, $serial);
        if (
            isset($attributes['data-interaction-subtype'])
            && is_string($attributes['data-interaction-subtype'])
            && $attributes['data-interaction-subtype'] !== ''
        ) {
            $this->defineBaseType($attributes['data-interaction-subtype']);
        }
    }
    /**
     * the QTI tag name as defined in QTI standard
     *
     * @access protected
     * @var string
     */
    protected static $qtiTagName = 'graphicAssociateInteraction';
    protected static $choiceClass = 'oat\\taoQtiItem\\model\\qti\\choice\\AssociableHotspot';


    protected function getUsedAttributes(): array
    {
        return array_merge(
            parent::getUsedAttributes(),
            [
                'oat\\taoQtiItem\\model\\qti\\attribute\\DataInteractionSubtype',
                'oat\\taoQtiItem\\model\\qti\\attribute\\MaxAssociations',
                'oat\\taoQtiItem\\model\\qti\\attribute\\MinAssociations'
            ]
        );
    }

    /**
     * Set the baseType for this interaction (pair or directedPair).
     */
    public function setBaseType(string $baseType): void
    {
        $normalized = strtolower($baseType);
        $allowed = ['pair', 'directedpair'];
        if (!in_array($normalized, $allowed, true)) {
            common_Logger::w(sprintf('Invalid baseType "%s" for GraphicAssociateInteraction', $baseType));
            $normalized = 'pair';
        }

        static::$baseType = $normalized;
    }

    /**
     * Get the interaction base type.
     */
    public function getBaseType(): string
    {
        return strtolower(static::$baseType);
    }

    /**
     * Define baseType based on interaction subtype (e.g. arrow).
     */
    private function defineBaseType(string $subtype): void
    {
        if (is_string($subtype) && strtolower($subtype) === self::ARROW_MODE) {
            $this->setBaseType(self::DIRECT_PAIR);
            return;
        }
        $this->setBaseType(self::PAIR);
    }
}
