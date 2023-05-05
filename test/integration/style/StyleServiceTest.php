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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\test\integration\style;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\style\StyleService;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\qti\Service;

class StyleServiceTest extends TaoPhpUnitTestRunner
{
    private $itemClass = null;
    private $items = [];

    /**
     * tests initialization
     * load qti service
     */
    public function setUp(): void
    {
        TaoPhpUnitTestRunner::initTest();
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoItems');

        $itemTopClass = new \core_kernel_classes_Class('http://www.tao.lu/Ontologies/TAOItem.rdf#Item');
        $this->itemClass = $itemTopClass->createSubClass('style service unit test', 'create for unit test ' . time());

        $itemService = \taoItems_models_classes_ItemsService::singleton();
        $qtiItemModel = new \core_kernel_classes_Resource(ItemModel::MODEL_URI);

        $itemA = $this->itemClass->createInstance('itemA');
        $itemService->setItemModel($itemA, $qtiItemModel);
        Service::singleton()
            ->saveXmlItemToRdfItem(file_get_contents(dirname(__FILE__) . '/samples/itemA.xml'), $itemA);
        $this->items[] = $itemA;

        $itemB = $this->itemClass->createInstance('itemB');
        $itemService->setItemModel($itemB, $qtiItemModel);
        Service::singleton()
            ->saveXmlItemToRdfItem(file_get_contents(dirname(__FILE__) . '/samples/itemB.xml'), $itemB);
        $this->items[] = $itemB;

        $itemC = $this->itemClass->createInstance('itemC');
        $itemService->setItemModel($itemC, $qtiItemModel);
        Service::singleton()
            ->saveXmlItemToRdfItem(file_get_contents(dirname(__FILE__) . '/samples/itemC.xml'), $itemC);
        $this->items[] = $itemC;
    }

    public function tearDown(): void
    {
        $this->itemClass->delete();
        foreach ($this->items as $item) {
            $item->delete();
        }
        parent::tearDown();
    }

    public function testGetBodyStyles()
    {
        $styleService = StyleService::singleton();

        $itemA = reset($this->items);

        $styles = $styleService->getBodyStyles($itemA);
        $this->assertEquals(2, count(array_intersect(['customerA-theme1', 'customerA-theme2'], $styles)));
    }

    public function testGetClassBodyStyles()
    {
        $styleService = StyleService::singleton();

        $usage = $styleService->getClassBodyStyles($this->itemClass);
        $this->assertTrue(is_array($usage));

        $this->assertTrue(isset($usage['all']) && is_array($usage['all']));
        $this->assertTrue(isset($usage['checked']) && is_array($usage['checked']));
        $this->assertTrue(isset($usage['indeterminate']) && is_array($usage['indeterminate']));

        $this->assertEquals(
            3,
            count(array_intersect(['customerA-theme1', 'customerA-theme2', 'customerA-theme3'], $usage['all']))
        );
        $this->assertEquals(1, count(array_intersect(['customerA-theme1'], $usage['checked'])));
        $this->assertEquals(
            2,
            count(array_intersect(['customerA-theme2', 'customerA-theme3'], $usage['indeterminate']))
        );
    }

    public function testAddRemoveBodyStyles()
    {
        $styleService = StyleService::singleton();

        $itemA = reset($this->items);

        $styles = $styleService->getBodyStyles($itemA);
        $this->assertEquals(2, count(array_intersect(['customerA-theme1', 'customerA-theme2'], $styles)));

        $styleService->addBodyStyles(['AAA', 'BBB'], $itemA);

        $styles = $styleService->getBodyStyles($itemA);
        $this->assertEquals(4, count(array_intersect(['customerA-theme1', 'customerA-theme2', 'AAA', 'BBB'], $styles)));

        $styleService->removeBodyStyles(['AAA'], $itemA);

        $styles = $styleService->getBodyStyles($itemA);
        $this->assertEquals(3, count(array_intersect(['customerA-theme1', 'customerA-theme2', 'BBB'], $styles)));
    }

    public function testAddRemoveClassBodyStyles()
    {
        $styleService = StyleService::singleton();

        //check that all items have some styles intially
        foreach ($this->items as $item) {
            $styles = $styleService->getBodyStyles($item);
            $this->assertTrue(count($styles) > 0);
        }

        $styleService->removeClassBodyStyles(
            ['customerA-theme1', 'customerA-theme2', 'customerA-theme3'],
            $this->itemClass
        );

        //check that all styles have been modified
        foreach ($this->items as $item) {
            $styles = $styleService->getBodyStyles($item);
            $this->assertEquals(0, count($styles));
        }

        $styleService->addClassBodyStyles(
            ['customerA-theme1', 'customerA-theme2', 'customerA-theme3'],
            $this->itemClass
        );

        //check that all styles have set again
        foreach ($this->items as $item) {
            $styles = $styleService->getBodyStyles($item);
            $this->assertEquals(
                3,
                count(array_intersect(['customerA-theme1', 'customerA-theme2', 'customerA-theme3'], $styles))
            );
        }
    }
}
