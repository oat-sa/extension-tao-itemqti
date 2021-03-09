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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\import;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\import\CsvItem;

class CsvItemTest extends TestCase
{
    /** @var CsvItem */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new CsvItem(
            'name',
            'question',
            true,
            5,
            10,
            'en-US',
            [],
            [],
            7.5
        );
    }

    public function testGetters(): void
    {
        $this->assertSame('name', $this->subject->getName());
        $this->assertSame('question', $this->subject->getQuestion());
        $this->assertSame(5, $this->subject->getMinChoices());
        $this->assertSame(10, $this->subject->getMaxChoices());
        $this->assertSame(7.5, $this->subject->getMaxScore());
        $this->assertSame([], $this->subject->getChoices());
        $this->assertSame([], $this->subject->getMetadata());
        $this->assertTrue($this->subject->isShuffle());
    }
}
