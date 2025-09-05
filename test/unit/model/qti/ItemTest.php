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
use League\Flysystem\FilesystemException;
use League\Flysystem\Local\LocalFilesystemAdapter;
use oat\generis\test\ServiceManagerMockTrait;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiItem\model\qti\Item;
use PHPUnit\Framework\TestCase;
use League\Flysystem\Filesystem;

class ItemTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const PRODUCT_NAME = 'TAO';

    private FileSystemService $fileSystemService;

    protected function setUp(): void
    {
        parent::setUp();

        if (!defined('PRODUCT_NAME')) {
            define('PRODUCT_NAME', self::PRODUCT_NAME);
        }

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

    /**
     * Testing toQTI() method on Item class
     * @return void
     */
    public function testToQTI(): void
    {
        $expectedItemQti = $this->readSampleFile('testToQti_expectedItemQti.xml');

        $item = new Item();
        $itemQti = $this->removeToolVersionAttribute($item->toQTI());

        self::assertEquals($expectedItemQti, $itemQti);
    }

    /**
     * Testing toQTI() method on Item class with attribute dir=rtl
     * @return void
     * @throws \oat\taoQtiItem\model\qti\exception\QtiModelException
     */
    public function testToQTIWithDirAttributeInItemBody(): void
    {
        $expectedItemQti = $this->readSampleFile('testToQTIWithDirAttributeInItemBody_expectedItemQti.xml');

        $item = new Item();
        $item->getBody()->setAttribute('dir', 'rtl');
        $itemQti = $this->removeToolVersionAttribute($item->toQTI());

        self::assertEquals($expectedItemQti, $itemQti);
    }

    /**
     * remove tool version because every release this value changes
     * @param string $itemQti
     * @return string
     */
    private function removeToolVersionAttribute(string $itemQti): string
    {
        return preg_replace('/toolVersion="[0-9]{4}\.[0-9]{2}"/u', 'toolVersion=""', $itemQti);
    }

    /**
     * @param string $name
     * @return string
     * @throws FilesystemException
     */
    private function readSampleFile(string $name): string
    {
        $adapter = new LocalFilesystemAdapter(
            dirname(__DIR__, 2) . '/samples/model/qti/item'
        );

        $filesystem = new Filesystem($adapter);

        return $filesystem->read($name);
    }
}
