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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti;

use common_ext_Extension;
use common_ext_ExtensionsManager;
use DOMDocument;
use League\Flysystem\FilesystemException;
use League\Flysystem\Local\LocalFilesystemAdapter;
use oat\oatbox\service\ServiceManager;
use oat\generis\test\ServiceManagerMockTrait;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\ParserFactory;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use League\Flysystem\Filesystem;

class ParserFactoryTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const PRODUCT_NAME = 'TAO';

    private LoggerInterface $logger;

    protected function setUp(): void
    {
        parent::setUp();

        if (!defined('PRODUCT_NAME')) {
            define('PRODUCT_NAME', self::PRODUCT_NAME);
        }

        $this->logger = $this->createMock(LoggerInterface::class);

        $commonExtensionMock = $this->createMock(common_ext_Extension::class);
        $commonExtensionMock
            ->method('getDir')
            ->willReturn(ROOT_PATH . DIRECTORY_SEPARATOR . 'taoQtiItem' . DIRECTORY_SEPARATOR);

        $extensionsManagerMock = $this->createMock(common_ext_ExtensionsManager::class);
        $extensionsManagerMock
            ->method('getExtensionById')
            ->willReturn($commonExtensionMock);

        $applicationServiceMock = $this->createMock(ApplicationService::class);

        $sm = $this->getServiceManagerMock([
            ApplicationService::SERVICE_ID => $applicationServiceMock,
            common_ext_ExtensionsManager::class => $extensionsManagerMock
        ]);

        ServiceManager::setServiceManager($sm);
    }

    public function testParseItem(): void
    {
        $itemDocument = $this->readSampleFile('testParseItem_itemDocument.xml');
        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new ParserFactory($dom);

        $this->logger->expects($this->once())->method('debug')
            ->with('Started parsing of QTI item i61dbf0028b0ca4904497f514befea47f', ['TAOITEMS']);
        $parser->setLogger($this->logger);

        $item = $parser->load();

        self::assertInstanceOf(Item::class, $item);
        self::assertEquals([], $item->getBody()->getAttributeValues());
        self::assertEquals(
            '
        <div class="grid-row">
            <div class="col-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
            </div>
        </div>
    ',
            $item->getBody()->getBody()
        );
    }

    public function testParseItemWithDirAttributeOnItemBody(): void
    {
        $itemDocument = $this->readSampleFile('testParseItemWithDirAttributeOnItemBody_itemDocument.xml');

        $dom = new DOMDocument();
        $dom->loadXML($itemDocument);

        $parser = new ParserFactory($dom);

        $this->logger->expects($this->once())
            ->method('debug')
            ->with('Started parsing of QTI item i61dbf0028b0ca4904497f514befea47f', ['TAOITEMS']);
        $parser->setLogger($this->logger);
        $item = $parser->load();

        self::assertInstanceOf(Item::class, $item);
        self::assertEquals(['dir' => 'rtl'], $item->getBody()->getAttributeValues());
        self::assertEquals(
            '
        <div class="grid-row">
            <div class="col-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>
            </div>
        </div>
    ',
            $item->getBody()->getBody()
        );
    }

    /**
     * @param string $name
     * @return string
     * @throws FilesystemException
     */
    private function readSampleFile(string $name): string
    {
        $adapter = new LocalFilesystemAdapter(
            dirname(__DIR__, 2) . '/samples/model/qti/parserFactory'
        );

        $filesystem = new Filesystem($adapter);

        return $filesystem->read($name);
    }
}
