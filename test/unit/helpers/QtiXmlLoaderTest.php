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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\helpers;

use common_ext_Extension as Extension;
use DOMDocument;
use oat\taoQtiItem\helpers\QtiXmlLoader;
use PHPUnit\Framework\TestCase;
use common_ext_ExtensionsManager as ExtensionsManager;
use oat\taoQtiItem\model\qti\exception\QtiModelException;

class QtiXmlLoaderTest extends TestCase
{
    public function setUp(): void
    {
        $this->extensionsManagerMock = $this->createMock(ExtensionsManager::class);
        $this->extensionMock = $this->createMock(Extension::class);
        $this->extensionsManagerMock->method('getExtensionById')->willReturn($this->extensionMock);
        $this->extensionMock->method('getConfig')->willReturn([
            'formatOutput' => true,
            'preserveWhiteSpace' => false,
            'validateOnParse' => false,
        ]);
        $this->subject = new QtiXmlLoader($this->extensionsManagerMock);
    }

    public function testLoad()
    {
        $qti = file_get_contents(__DIR__ . '/qtiExamples/qti.xml');
        $sub = $this->subject->load($qti);

        $this->assertInstanceOf(DOMDocument::class, $sub);
    }

    public function testInvalidLoad()
    {
        $this->expectException(QtiModelException::class);
        $qti = file_get_contents(__DIR__ . '/qtiExamples/invalidQti.xml');
        $this->subject->load($qti);
    }
}
