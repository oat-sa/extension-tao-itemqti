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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2018-2022 (original work) Open Assessment Technologies SA;
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\portableElement\test;

use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\websource\ActionWebSource;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\exception\PortableModelMissing;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\portableElement\storage\PortableElementFileStorage;
use oat\taoQtiItem\model\qti\ParserFactory;

class PortableElementServiceTest extends TaoPhpUnitTestRunner
{
    /**
     * @var PortableElementService
     */
    protected $instance;

    /** @var PortableElementService */
    private $service;

    public function setUp(): void
    {
        $this->service = new PortableElementService();
        $this->service->setServiceLocator(ServiceManager::getServiceManager());
        $this->createFileStorage();
        $this->clearSamplePortableElements();
    }

    private function createFileStorage(): void
    {
        $fsId = 'portableElementStorage';
        /** @var FileSystemService $fsm */
        $fsm = ServiceManager::getServiceManager()->get(FileSystemService::SERVICE_ID);
        if (!ServiceManager::getServiceManager()->has(FileSystemService::SERVICE_ID)) {
            ServiceManager::getServiceManager()->registerService(FileSystemService::SERVICE_ID, $fsm);
        }
        if (!$fsm->hasDirectory($fsId)) {
            $fsm->createFileSystem($fsId);
        }
        $itemImsPci = 'qtiItemImsPci';
        if (!$fsm->hasDirectory($itemImsPci)) {
            $fsm->createFileSystem($itemImsPci);
        }

        if (!ServiceManager::getServiceManager()->has(PortableElementFileStorage::SERVICE_ID)) {
            $portableElementStorage = new PortableElementFileStorage([
                PortableElementFileStorage::OPTION_FILESYSTEM => $fsId,
                PortableElementFileStorage::OPTION_WEBSOURCE => ActionWebSource::spawnWebsource($fsId)->getId()
            ]);
            ServiceManager::getServiceManager()->register(
                PortableElementFileStorage::SERVICE_ID,
                $portableElementStorage
            );
        }
    }

    public function tearDown(): void
    {
        $this->clearSamplePortableElements();
        $this->service = null;
    }

    private function clearSamplePortableElements(): void
    {
        $pciLast = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA');
        if (!is_null($pciLast)) {
            $pciLast = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA');
            $pciLast->getModel()->getRegistry()->removeAllVersions('pciSampleA');
        }
    }

    public function testRegisterFromDirectorySource(): void
    {
        //register an initial version v0.4.0;
        $this->service->registerFromDirectorySource(__DIR__ . '/samples/pciDir040');

        $pciLast = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA');
        $registry = $pciLast->getModel()->getRegistry();
        $this->assertEquals('0.4.0', $pciLast->getVersion());
        $this->assertNotFalse(
            strpos($registry->getFileStream($pciLast, 'pciCreator.js')->getContents(), '[version=0.4.0]')
        );

        $pci040 = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.0');
        $this->assertEquals('0.4.0', $pci040->getVersion());
        $this->assertNotFalse(
            strpos($registry->getFileStream($pci040, 'pciCreator.js')->getContents(), '[version=0.4.0]')
        );

        //check that the actual file is the same as 0.4.0
        $pciAlias = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.*');
        $this->assertEquals('0.4.*', $pciAlias->getVersion());
        $this->assertNotFalse(
            strpos($registry->getFileStream($pciAlias, 'pciCreator.js')->getContents(), '[version=0.4.0]')
        );

        //register a fix v0.4.1
        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir041');

        $pci040 = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.0');
        $this->assertEquals('0.4.0', $pci040->getVersion());
        $this->assertNotFalse(
            strpos($registry->getFileStream($pci040, 'pciCreator.js')->getContents(), '[version=0.4.0]')
        );

        $pci041 = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.1');
        $this->assertEquals('0.4.1', $pci041->getVersion());
        $this->assertNotFalse(
            strpos($registry->getFileStream($pci041, 'pciCreator.js')->getContents(), '[version=0.4.1]')
        );

        //check that the alias points to the same files as the new v0.4.1
        $pciAlias = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.*');
        $this->assertEquals('0.4.*', $pciAlias->getVersion());
        $this->assertNotFalse(
            strpos($registry->getFileStream($pciAlias, 'pciCreator.js')->getContents(), '[version=0.4.1]')
        );

        //the most recent version is still v0.4.1
        $pciLast = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA');
        $this->assertEquals('0.4.1', $pciLast->getVersion());
        $this->assertNotFalse(
            strpos($registry->getFileStream($pciLast, 'pciCreator.js')->getContents(), '[version=0.4.1]')
        );
    }

    public function testGetLatestCompatibleVersionElementById(): void
    {
        //register only version v0.4.0;
        $this->service->registerFromDirectorySource(__DIR__ . '/samples/pciDir040');

        $lower = $this->service->getLatestCompatibleVersionElementById('PCI', 'pciSampleA', '0.4.*');
        $this->assertNotEmpty($lower);

        $upper = $this->service->getLatestCompatibleVersionElementById('PCI', 'pciSampleA', '1.0.*');
        $this->assertEmpty($upper);

        //then register v1.0.1
        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir101');

        $upper = $this->service->getLatestCompatibleVersionElementById('PCI', 'pciSampleA', '1.0.*');
        $this->assertNotEmpty($upper);
        $this->assertEquals('1.0.1', $upper->getVersion());

        $upper = $this->service->getLatestCompatibleVersionElementById('PCI', 'pciSampleA', '3.0.0');
        $this->assertEmpty($upper);

        $lower = $this->service->getLatestCompatibleVersionElementById('PCI', 'pciSampleA', '0.2.1');
        $this->assertEquals('0.4.0', $lower->getVersion());

        $notExisting = $this->service->getLatestCompatibleVersionElementById('PCI', 'Unknown', '1.0.*');
        $this->assertNull($notExisting);
    }

    public function testGetPortableElementByClass()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/samples/item/pci_pic_sample_1.xml');
        $parser = new ParserFactory($xml);
        $item = $parser->load();

        $pcis = $this->service->getPortableElementByClass(PortableElementService::PORTABLE_CLASS_INTERACTION, $item);

        $this->assertEquals(2, count($pcis));
        $this->assertTrue(isset($pcis['likertScaleInteraction']));
        $this->assertEquals(1, count($pcis['likertScaleInteraction']));
        $this->assertTrue(isset($pcis['liquidsInteraction']));
        $this->assertEquals(1, count($pcis['liquidsInteraction']));
    }

    public function testGetPortableElementByClassAlias()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/samples/item/pci_sample_1.xml');
        $parser = new ParserFactory($xml);
        $item = $parser->load();

        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir040');

        $pcis = $this->service->getPortableElementByClass(PortableElementService::PORTABLE_CLASS_INTERACTION, $item);
        $this->assertEquals(1, count($pcis));
        $this->assertTrue(isset($pcis['pciSampleA']));
        $pci = reset($pcis['pciSampleA']);
        $this->assertEquals('0.4.0', $pci['version']);

        $pcis = $this->service->getPortableElementByClass(
            PortableElementService::PORTABLE_CLASS_INTERACTION,
            $item,
            true
        );
        $pci = reset($pcis['pciSampleA']);
        $this->assertEquals('0.4.*', $pci['version']);

        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir041');

        $pcis = $this->service->getPortableElementByClass(PortableElementService::PORTABLE_CLASS_INTERACTION, $item);
        $pci = reset($pcis['pciSampleA']);
        $this->assertEquals('0.4.1', $pci['version']);

        $pcis = $this->service->getPortableElementByClass(
            PortableElementService::PORTABLE_CLASS_INTERACTION,
            $item,
            true
        );
        $pci = reset($pcis['pciSampleA']);
        $this->assertEquals('0.4.*', $pci['version']);
    }

    public function testSetBaseUrlToPortableData()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/samples/item/pci_sample_1.xml');
        $parser = new ParserFactory($xml);
        $item = $parser->load();

        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir040');

        $pcis = $this->service->getPortableElementByClass(PortableElementService::PORTABLE_CLASS_INTERACTION, $item);
        $this->assertEquals(1, count($pcis));
        $this->assertTrue(isset($pcis['pciSampleA']));
        $pci = reset($pcis['pciSampleA']);

        $this->service->setBaseUrlToPortableData($pci);

        $this->assertTrue(isset($pci['baseUrl']));
    }

    public function testSetBaseUrlToPortableDataUnknownVersion()
    {
        $this->expectException(PortableElementNotFoundException::class);

        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/samples/item/pci_sample_1.xml');
        $parser = new ParserFactory($xml);
        $item = $parser->load();

        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir040');

        $pcis = $this->service->getPortableElementByClass(PortableElementService::PORTABLE_CLASS_INTERACTION, $item);
        $this->assertEquals(1, count($pcis));
        $this->assertTrue(isset($pcis['pciSampleA']));
        $pci = reset($pcis['pciSampleA']);

        //setting a version that does not exist
        $pci['version'] = '9.9.9';
        $this->service->setBaseUrlToPortableData($pci);
    }

    public function testSetBaseUrlToPortableDataUnknownModel()
    {
        $this->expectException(PortableModelMissing::class);

        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/samples/item/pci_sample_1.xml');
        $parser = new ParserFactory($xml);
        $item = $parser->load();

        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir040');

        $pcis = $this->service->getPortableElementByClass(PortableElementService::PORTABLE_CLASS_INTERACTION, $item);
        $this->assertEquals(1, count($pcis));
        $this->assertTrue(isset($pcis['pciSampleA']));
        $pci = reset($pcis['pciSampleA']);

        //setting a version that does not exist
        $pci['model'] = 'UNKNOWN_MODEL';
        $this->service->setBaseUrlToPortableData($pci);
    }
}
