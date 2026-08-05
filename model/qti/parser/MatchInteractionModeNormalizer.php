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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\parser;

use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\interaction\MatchInteraction;

/**
 * Items authored outside of TAO carry no display mode on their match interactions. The QTI
 * specification defines the non tabular presentation as the default one, so it is made explicit
 * here to give the item creator and the delivery renderers an unambiguous mode to work with.
 */
class MatchInteractionModeNormalizer
{
    public const MODE_TABULAR = 'qti-match-tabular';
    public const MODE_NON_TABULAR = 'qti-match-non-tabular';

    public function normalize(Item $item): void
    {
        foreach ($item->getInteractions() as $interaction) {
            if (!$interaction instanceof MatchInteraction) {
                continue;
            }

            if (!$this->hasDisplayMode((string)$interaction->getAttributeValue('class'))) {
                $interaction->addClass(self::MODE_NON_TABULAR);
            }
        }
    }

    private function hasDisplayMode(string $class): bool
    {
        $classes = preg_split('/\s+/', trim($class), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return in_array(self::MODE_TABULAR, $classes, true)
            || in_array(self::MODE_NON_TABULAR, $classes, true);
    }
}
