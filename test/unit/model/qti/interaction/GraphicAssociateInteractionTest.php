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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\interaction;

use oat\taoQtiItem\model\qti\attribute\DataInteractionSubtype;
use oat\taoQtiItem\model\qti\interaction\GraphicAssociateInteraction;
use PHPUnit\Framework\TestCase;

class GraphicAssociateInteractionTest extends TestCase
{
    public function testConstructorSetsBaseTypeFromSubtype(): void
    {
        $interaction = new GraphicAssociateInteraction(['data-interaction-subtype' => 'arrow']);

        self::assertSame('directedpair', $interaction->getBaseType());
    }

    public function testSetBaseTypeInvalidFallsBackToPair(): void
    {
        $interaction = new GraphicAssociateInteraction();
        $interaction->setBaseType('invalid');

        self::assertSame('pair', $interaction->getBaseType());
    }

    public function testDataInteractionSubtypeUsesExplicitAttribute(): void
    {
        $interaction = new class (['data-interaction-subtype' => 'arrow']) extends GraphicAssociateInteraction {
            public function getAttributeClassName(string $name): ?string
            {
                $attribute = $this->getAttribute($name);

                return $attribute ? get_class($attribute) : null;
            }
        };

        self::assertSame(
            DataInteractionSubtype::class,
            $interaction->getAttributeClassName('data-interaction-subtype')
        );
        self::assertSame('arrow', $interaction->getAttributeValue('data-interaction-subtype'));
    }
}
