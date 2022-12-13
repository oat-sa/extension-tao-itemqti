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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\container;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\container\ContainerItemBody;

class ContainerItemBodyTest extends TestCase
{
    public function testToArray(): void
    {
        $itemBody = <<<ITEM_BODY
    <div class="grid-row">
      <div class="col-12">
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
      </div>
    </div>
ITEM_BODY;

        $container = new ContainerItemBody($itemBody);
        $containerArray = $container->toArray();

        self::assertEquals($itemBody, $containerArray['body']);
        self::assertEquals([], $containerArray['attributes']);
        self::assertEquals(new \stdClass(), $containerArray['elements']);
    }

    public function testToArrayWithBodyAttributes(): void
    {
        $itemBody = <<<ITEM_BODY
    <div class="grid-row">
      <div class="col-12">
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
      </div>
    </div>
ITEM_BODY;

        $container = new ContainerItemBody($itemBody);
        $container->setAttribute('dir', 'ltr');
        $containerArray = $container->toArray();

        self::assertEquals($itemBody, $containerArray['body']);
        self::assertEquals(['dir' => 'ltr'], $containerArray['attributes']);
        self::assertEquals(new \stdClass(), $containerArray['elements']);
    }
}
