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

use oat\taoQtiItem\model\qti\container\ContainerStatic;
use oat\taoQtiItem\model\qti\interaction\GraphicInteraction;
use oat\taoQtiItem\model\qti\QtiObject;
use PHPUnit\Framework\TestCase;

class GraphicInteractionTest extends TestCase
{
    private function buildInteraction(): GraphicInteraction
    {
        return new class extends GraphicInteraction {
            protected static $qtiTagName = 'dummyGraphicInteraction';
        };
    }

    public function testInheritsObjectAndPrompt(): void
    {
        $interaction = $this->buildInteraction();

        self::assertInstanceOf(QtiObject::class, $interaction->getObject());
        self::assertInstanceOf(ContainerStatic::class, $interaction->getPrompt());
    }
}
