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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\portableElement\test;

use oat\oatbox\service\ServiceManager;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\portableElement\PortableElementService;

class PortableElementServiceTest extends TaoPhpUnitTestRunner
{
    /**
     * @var PortableElementService
     */
    protected $instance;

    public function setUp()
    {
        $this->service = new PortableElementService();
        $this->service->setServiceLocator(ServiceManager::getServiceManager());
    }

    public function tearDown()
    {
        $this->service = null;
    }

    public function testRegisterFromDirectorySource(){

        //register an initial version v0.4.0;
        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir040');

        $pciLast = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA');
        $registry = $pciLast->getModel()->getRegistry();
        $this->assertEquals('0.4.0', $pciLast->getVersion());
        $this->assertNotFalse(strpos($registry->getFileStream($pciLast, 'pciCreator.js')->getContents(), '[version=0.4.0]'));

        $pci040 = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.0');
        $this->assertEquals('0.4.0', $pci040->getVersion());
        $this->assertNotFalse(strpos($registry->getFileStream($pci040, 'pciCreator.js')->getContents(), '[version=0.4.0]'));

        //check that the actual file is the same as 0.4.0
        $pciAlias = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.*');
        $this->assertEquals('0.4.*', $pciAlias->getVersion());
        $this->assertNotFalse(strpos($registry->getFileStream($pciAlias, 'pciCreator.js')->getContents(), '[version=0.4.0]'));

        //register a fix v0.4.1
        $this->service->registerFromDirectorySource(dirname(__FILE__) . '/samples/pciDir041');

        $pci040 = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.0');
        $this->assertEquals('0.4.0', $pci040->getVersion());
        $this->assertNotFalse(strpos($registry->getFileStream($pci040, 'pciCreator.js')->getContents(), '[version=0.4.0]'));

        $pci041 = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.1');
        $this->assertEquals('0.4.1', $pci041->getVersion());
        $this->assertNotFalse(strpos($registry->getFileStream($pci041, 'pciCreator.js')->getContents(), '[version=0.4.1]'));

        //check that the alias points to the same files as the new v0.4.1
        $pciAlias = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA', '0.4.*');
        $this->assertEquals('0.4.*', $pciAlias->getVersion());
        $this->assertNotFalse(strpos($registry->getFileStream($pciAlias, 'pciCreator.js')->getContents(), '[version=0.4.1]'));

        //the most recent version is still v0.4.1
        $pciLast = $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA');
        $this->assertEquals('0.4.1', $pciLast->getVersion());
        $this->assertNotFalse(strpos($registry->getFileStream($pciLast, 'pciCreator.js')->getContents(), '[version=0.4.1]'));

        //remove all
        $pciLast->getModel()->getRegistry()->removeAllVersions('pciSampleA');
        $this->assertEquals(null, $this->service->getPortableElementByIdentifier('PCI', 'pciSampleA'));
    }
}