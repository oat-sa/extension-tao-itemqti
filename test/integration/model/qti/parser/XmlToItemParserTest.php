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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\integration\model\qti\parser;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\parser\XmlToItemParser;

class XmlToItemParserTest extends TestCase
{
    /** @var XmlToItemParser */
    private $subject;

    protected function setUp(): void
    {
        $this->subject = new XmlToItemParser();
    }

    public function testParse(): void
    {
        $this->assertInstanceOf(Item::class, $this->subject->parse($this->getEmptyQti()));
    }

    public function testParseAndSanitize(): void
    {
        $this->assertInstanceOf(Item::class, $this->subject->parseAndSanitize($this->getEmptyQti()));
    }

    private function getEmptyQti(): string
    {
        return __DIR__ . '/../../../samples/parser/valid/empty_qti_item.xml';
    }
}
