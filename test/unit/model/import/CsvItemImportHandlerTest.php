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
use oat\taoQtiItem\model\import\CsvItemImportHandler;
use oat\taoQtiItem\model\import\Metadata\MetadataResolver;
use oat\taoQtiItem\model\import\Parser\CsvParser;
use oat\taoQtiItem\model\import\Template\ItemsQtiTemplateRender;
use oat\taoQtiItem\model\qti\ImportService;
use PHPUnit\Framework\MockObject\MockObject;
use taoItems_models_classes_ItemsService;

class CsvItemImportHandlerTest extends TestCase
{
    /** @var CsvItemImportHandler */
    private $subject;

    /** @var MetadataResolver|MockObject */
    private $metadataResolver;

    /** @var ItemsQtiTemplateRender|MockObject */
    private $itemsQtiTemplateRender;

    /** @var taoItems_models_classes_ItemsService|MockObject */
    private $itemsService;

    /** @var ImportService|MockObject */
    private $importService;

    /** @var CsvParser|MockObject */
    private $csvParser;

    public function setUp(): void
    {
        $this->csvParser = $this->createMock(CsvParser::class);
        $this->importService = $this->createMock(ImportService::class);
        $this->itemsService = $this->createMock(taoItems_models_classes_ItemsService::class);
        $this->itemsQtiTemplateRender = $this->createMock(ItemsQtiTemplateRender::class);
        $this->metadataResolver = $this->createMock(MetadataResolver::class);

        $this->subject = new CsvItemImportHandler();
        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    CsvParser::class => $this->csvParser,
                    ImportService::SERVICE_ID => $this->importService,
                    taoItems_models_classes_ItemsService::class => $this->itemsService,
                    ItemsQtiTemplateRender::class => $this->itemsQtiTemplateRender,
                    MetadataResolver::class => $this->metadataResolver,
                ]
            )
        );
    }

    public function testImport(): void
    {
        $this->markTestSkipped('TODO');
    }
}
