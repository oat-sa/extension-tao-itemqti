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

namespace oat\taoQtiItem\test\unit\model\qti\parser;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;
use oat\taoQtiItem\model\qti\parser\TextReaderReferencesExtractor;
use PHPUnit\Framework\MockObject\MockObject;

class TextReaderReferencesExtractorTest extends TestCase
{
    private const MEDIA_LINK_1 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d4';
    private const MEDIA_LINK_2 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d5';

    private TextReaderReferencesExtractor $subject;

    protected function setUp(): void
    {
        $this->subject = new TextReaderReferencesExtractor();
    }

    public function testExtract(): void
    {
        $portableInteraction = $this->createTextReaderInteraction(
            [
                [
                    'content' => [
                        '<p><img src="' . self::MEDIA_LINK_1 . '"/></p>',
                    ],
                ],
            ]
        );
        $imsInteraction = $this->createImsTextReaderInteraction(
            [
                [
                    'content' => [
                        '<p><img src="' . self::MEDIA_LINK_1 . '"/></p>',
                        '<p><img src="' . self::MEDIA_LINK_2 . '"/></p>',
                    ],
                ],
            ]
        );

        /** @var Item|MockObject $item */
        $item = $this->createMock(Item::class);
        $item->expects($this->exactly(2))
            ->method('getComposingElements')
            ->willReturnMap(
                [
                    [PortableCustomInteraction::class, [$portableInteraction]],
                    [ImsPortableCustomInteraction::class, [$imsInteraction]],
                ]
            );

        $this->assertSame(
            [
                self::MEDIA_LINK_1,
                self::MEDIA_LINK_2,
            ],
            $this->subject->extract($item)
        );
    }

    public function testExtractFromInteraction(): void
    {
        $interaction = $this->createTextReaderInteraction(
            [
                [
                    'content' => [
                        '<p><img src="' . self::MEDIA_LINK_1 . '"/></p>',
                        '<p><img src="' . self::MEDIA_LINK_2 . '"/></p>',
                        '<p><img src="' . self::MEDIA_LINK_1 . '"/></p>',
                    ],
                ],
            ]
        );

        $this->assertSame(
            [
                self::MEDIA_LINK_1,
                self::MEDIA_LINK_2,
            ],
            $this->subject->extractFromInteraction($interaction)
        );
    }

    public function testGetTextReaderInteractions(): void
    {
        $textReaderInteraction = $this->createTextReaderInteraction([]);
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
            [$textReaderInteraction],
            $this->subject->getTextReaderInteractions($item)
        );
    }

    private function createTextReaderInteraction(array $pages): PortableCustomInteraction|MockObject
    {
        $interaction = $this->createMock(PortableCustomInteraction::class);
        $interaction->method('getTypeIdentifier')
            ->willReturn('textReaderInteraction');
        $interaction->method('getProperties')
            ->willReturn(['pages' => json_encode($pages)]);

        return $interaction;
    }

    private function createImsTextReaderInteraction(array $pages): ImsPortableCustomInteraction|MockObject
    {
        $interaction = $this->createMock(ImsPortableCustomInteraction::class);
        $interaction->method('getTypeIdentifier')
            ->willReturn('textReaderInteraction');
        $interaction->method('getProperties')
            ->willReturn(['pages' => json_encode($pages)]);

        return $interaction;
    }
}
