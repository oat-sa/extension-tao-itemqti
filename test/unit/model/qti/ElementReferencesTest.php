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

namespace oat\taoQtiItem\test\unit\model\qti;

use oat\taoQtiItem\model\qti\ElementReferences;
use oat\generis\test\TestCase;

class ElementReferencesTest extends TestCase
{
    private const MEDIA_LINK_1 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d4';
    private const MEDIA_LINK_2 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d5';
    private const MEDIA_LINK_3 = 'taomedia://mediamanager/https_2_test-tao-deploy_0_docker_0_localhost_1_ontologies_1_'
        . 'tao_0_rdf_3_i5ec293a38ebe623833180e3b0a547a6d3';

    /** @var ElementReferences */
    private $subject;

    protected function setUp(): void
    {
        $this->subject = new ElementReferences(
            [self::MEDIA_LINK_1],
            [self::MEDIA_LINK_2],
            [self::MEDIA_LINK_3]
        );
    }

    public function testGetters(): void
    {
        $this->assertSame($this->subject->getXIncludeReferences(), [self::MEDIA_LINK_1]);
        $this->assertSame($this->subject->getObjectReferences(), [self::MEDIA_LINK_2]);
        $this->assertSame($this->subject->getImgReferences(), [self::MEDIA_LINK_3]);
        $this->assertSame(
            $this->subject->getAllReferences(),
            [
                self::MEDIA_LINK_1,
                self::MEDIA_LINK_2,
                self::MEDIA_LINK_3,
            ]
        );
    }
}
