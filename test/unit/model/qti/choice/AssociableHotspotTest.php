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

namespace oat\taoQtiItem\test\unit\model\qti\choice;

use oat\taoQtiItem\model\qti\choice\AssociableHotspot;
use PHPUnit\Framework\TestCase;

class AssociableHotspotTest extends TestCase
{
    public function testDataAttributesAreOptional(): void
    {
        $choice = new AssociableHotspot();

        self::assertTrue($choice->hasAttribute('data-start'));
        self::assertTrue($choice->hasAttribute('data-end'));

        $values = $choice->getAttributeValues();

        self::assertArrayNotHasKey('data-start', $values);
        self::assertArrayNotHasKey('data-end', $values);
    }

    public function testDataAttributesIncludedWhenSet(): void
    {
        $choice = new AssociableHotspot();
        $choice->setAttribute('data-start', true);
        $choice->setAttribute('data-end', true);

        $values = $choice->getAttributeValues();

        self::assertArrayHasKey('data-start', $values);
        self::assertArrayHasKey('data-end', $values);
        self::assertTrue($values['data-start']);
        self::assertTrue($values['data-end']);
    }
}
