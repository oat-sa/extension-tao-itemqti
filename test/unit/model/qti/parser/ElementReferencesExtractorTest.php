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

use PHPUnit\Framework\TestCase;
use oat\taoQtiItem\model\qti\ElementReferences;
use oat\taoQtiItem\model\qti\Img;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\parser\ElementReferencesExtractor;
use oat\taoQtiItem\model\qti\parser\TextReaderReferencesExtractor;
use oat\taoQtiItem\model\qti\QtiObject;
use oat\taoQtiItem\model\qti\XInclude;
use oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;
use PHPUnit\Framework\MockObject\MockObject;

class ElementReferencesExtractorTest extends TestCase
{
    private const MEDIA_LINK_1 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d4';
    private const MEDIA_LINK_2 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d5';
    private const MEDIA_LINK_3 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d3';
    private const MEDIA_LINK_4 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d7';

    /** @var ElementReferencesExtractor */
    private $subject;

    protected function setUp(): void
    {
        $this->subject = new ElementReferencesExtractor(new TextReaderReferencesExtractor());
    }

    public function testExtract(): void
    {
        $element1 = $this->createMock(XInclude::class);
        $element1->method('attr')
            ->willReturn(self::MEDIA_LINK_1);

        $element2 = $this->createMock(XInclude::class);
        $element2->method('attr')
            ->willReturn(self::MEDIA_LINK_2);

        $element3 = $this->createMock(XInclude::class);
        $element3->method('attr')
            ->with('href')
            ->willReturn(self::MEDIA_LINK_2);

        /** @var Item|MockObject $item */
        $item = $this->createMock(Item::class);
        $item->expects($this->once())
            ->method('getComposingElements')
            ->with(XInclude::class)
            ->willReturn(
                [
                    $element1,
                    $element2,
                    $element3,
                ]
            );

        $this->assertSame(
            [
                self::MEDIA_LINK_1,
                self::MEDIA_LINK_2,
            ],
            $this->subject->extract($item, XInclude::class, 'href')
        );
    }

    public function testExtractAll(): void
    {
        $element1 = $this->createMock(XInclude::class);
        $element1->method('attr')
            ->willReturn(self::MEDIA_LINK_1);

        $element2 = $this->createMock(Img::class);
        $element2->method('attr')
            ->willReturn(self::MEDIA_LINK_2);

        $element3 = $this->createMock(QtiObject::class);
        $element3->method('attr')
            ->willReturn(self::MEDIA_LINK_3);

        $textReaderInteraction = $this->createMock(PortableCustomInteraction::class);
        $textReaderInteraction->method('getTypeIdentifier')
            ->willReturn('textReaderInteraction');
        $textReaderInteraction->method('getProperties')
            ->willReturn(
                [
                    'pages' => json_encode(
                        [
                            [
                                'content' => [
                                    '<p><img src="' . self::MEDIA_LINK_4 . '"/></p>',
                                    '<p><img src="' . self::MEDIA_LINK_4 . '"/></p>',
                                ],
                            ],
                        ]
                    ),
                ]
            );

        /** @var Item|MockObject $item */
        $item = $this->createMock(Item::class);
        $item->method('getComposingElements')
            ->willReturnOnConsecutiveCalls(
                ...[
                    [$element1],
                    [$element2],
                    [$element3],
                    [$textReaderInteraction],
                    [],
                ]
            );

        $this->assertEquals(
            new ElementReferences(
                [self::MEDIA_LINK_1],
                [self::MEDIA_LINK_2],
                [self::MEDIA_LINK_3],
                [self::MEDIA_LINK_4]
            ),
            $this->subject->extractAll($item)
        );
    }

    public function testExtractTextReaderReferences(): void
    {
        $textReaderInteraction = $this->createMock(PortableCustomInteraction::class);
        $textReaderInteraction->method('getTypeIdentifier')
            ->willReturn('textReaderInteraction');
        $textReaderInteraction->method('getProperties')
            ->willReturn(
                [
                    'pages' => json_encode(
                        [
                            [
                                'content' => [
                                    '<p><img src="' . self::MEDIA_LINK_4 . '"/></p>',
                                    '<p><img src="' . self::MEDIA_LINK_2 . '"/></p>',
                                ],
                            ],
                        ]
                    ),
                ]
            );

        $otherInteraction = $this->createMock(PortableCustomInteraction::class);
        $otherInteraction->method('getTypeIdentifier')
            ->willReturn('someOtherInteraction');

        /** @var Item|MockObject $item */
        $item = $this->createMock(Item::class);
        $item->expects($this->exactly(2))
            ->method('getComposingElements')
            ->willReturnMap(
                [
                    [PortableCustomInteraction::class, [$textReaderInteraction, $otherInteraction]],
                    [ImsPortableCustomInteraction::class, []],
                ]
            );

        $this->assertSame(
            [
                self::MEDIA_LINK_4,
                self::MEDIA_LINK_2,
            ],
            $this->subject->extractTextReaderReferences($item)
        );
    }
}
