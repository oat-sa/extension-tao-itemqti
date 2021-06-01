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

namespace oat\taoQtiItem\test\unit\model\import\Parser;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\import\Parser\TemplateHeaderParser;
use oat\taoQtiItem\model\import\TemplateInterface;
use oat\taoQtiItem\model\import\Repository\MetadataRepository;
use oat\taoQtiItem\model\import\CsvTemplate;
use oat\taoQtiItem\model\import\Repository\CsvTemplateRepository;

class TemplateHeaderParserTest extends TestCase
{
    private const CLASS_URI = 'uri';

    /** @var TemplateHeaderParser */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new TemplateHeaderParser();
        define('DEFAULT_LANG','en-US');        
    }

    public function testParse(): void
    {
        $classUri = self::CLASS_URI;

        $this->metadataRepositoryObject = $this->createMock(MetadataRepository::class);
        $metaDataArray = $this->metadataRepositoryObject->findMetadataByClassUri($classUri);

        $this->template = $this->createMock(TemplateInterface::class);
        $items = $this->subject->parse($this->getDefaultTemplate(), $metaDataArray);
        $this->assertGreaterThan(1, count($items));
    }

    private function getDefaultTemplate(): TemplateInterface
    {
        return new CsvTemplate(
            CsvTemplateRepository::DEFAULT,
            CsvTemplateRepository::DEFAULT_DEFINITION
        );
    }
}
