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

namespace oat\taoQtiItem\test\unit\model\qti\parser;

use oat\tao\model\media\TaoMediaResolver;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\parser\ElementIdsExtractor;
use oat\taoQtiItem\model\qti\parser\IncludedElementIdsExtractor;
use oat\generis\test\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

class IncludedElementIdsExtractorTest extends TestCase
{
    /** @var ElementIdsExtractor|MockObject */
    private $elementIdsExtractor;

    /** @var IncludedElementIdsExtractor */
    private $subject;

    protected function setUp(): void
    {
        $this->elementIdsExtractor = $this->createMock(ElementIdsExtractor::class);
        $this->subject = new IncludedElementIdsExtractor();
        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    ElementIdsExtractor::class => $this->elementIdsExtractor,
                ]
            )
        );
        //$this->subject->withMediaResolver($this->createMock(TaoMediaResolver::class));
    }

    public function testExtract(): void
    {
        $ids = ['id'];

        $this->elementIdsExtractor
            ->method('extract')
            ->willReturn($ids);

        $this->assertSame($ids, $this->subject->extract($this->createMock(Item::class)));
    }
}

