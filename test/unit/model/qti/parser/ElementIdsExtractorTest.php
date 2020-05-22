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

use oat\tao\model\media\MediaAsset;
use oat\tao\model\media\sourceStrategy\HttpSource;
use oat\tao\model\media\TaoMediaResolver;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\parser\ElementIdsExtractor;
use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\XInclude;
use PHPUnit\Framework\MockObject\MockObject;

class ElementIdsExtractorTest extends TestCase
{
    private const MEDIA_LINK_1 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d4';
    private const MEDIA_LINK_2 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d5';

    private const MEDIA_LINK_1_URI = 'https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d4';
    private const MEDIA_LINK_2_URI = 'https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d5';

    private const MEDIA_LINK_1_PARSED = 'https://test-tao-deploy.docker.localhost/ontologies/tao.rdf#i5ec293a38ebe623833180e3b0a547a6d4';
    private const MEDIA_LINK_2_PARSED = 'https://test-tao-deploy.docker.localhost/ontologies/tao.rdf#i5ec293a38ebe623833180e3b0a547a6d5';

    /** @var ElementIdsExtractor */
    private $subject;

    /** @var TaoMediaResolver */
    private $mediaResolver;

    protected function setUp(): void
    {
        $this->mediaResolver = $this->createMock(TaoMediaResolver::class);
        $this->subject = (new ElementIdsExtractor())->withMediaResolver($this->mediaResolver);
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

        $this->mediaResolver
            ->method('resolve')
            ->willReturnOnConsecutiveCalls(
                ... [
                    new MediaAsset(new HttpSource(), self::MEDIA_LINK_1_URI),
                    new MediaAsset(new HttpSource(), self::MEDIA_LINK_2_URI),
                    new MediaAsset(new HttpSource(), self::MEDIA_LINK_2_URI),
                ]
            );

        $this->assertSame(
            [
                self::MEDIA_LINK_1_PARSED,
                self::MEDIA_LINK_2_PARSED,
            ],
            $this->subject->extract($item, XInclude::class, 'href')
        );
    }
}
