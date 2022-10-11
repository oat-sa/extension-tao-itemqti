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

namespace oat\taoQtiItem\test\unit\mode\qti;

use oat\generis\test\TestCase;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiItem\model\qti\Item;

class ItemTest extends TestCase
{
    private const PRODUCT_NAME = 'TAO';

    protected function setUp(): void
    {
        parent::setUp();

        if (!defined('PRODUCT_NAME')) {
            define('PRODUCT_NAME', self::PRODUCT_NAME);
        }
        if (!defined('ROOT_URL')) {
            define('ROOT_URL', __DIR__ . '/../../../../../');
        }
        if (!defined('CONFIG_PATH')) {
            define('CONFIG_PATH', ROOT_URL . 'config/');
        }
        if (!defined('EXTENSION_PATH')) {
            define('EXTENSION_PATH', ROOT_URL);
        }

        ServiceManager::getServiceManager()->overload(
            ApplicationService::SERVICE_ID,
            $this->createMock(ApplicationService::class)
        );
    }

    public function testToQTI(): void
    {
        $expectedItemQti = <<<ITEM_QTI
<?xml version="1.0" encoding="UTF-8"?><assessmentItem
        xsi:schemaLocation=""
     identifier="Item_1" title="" label="" adaptive="false" timeDependent="false" toolName="TAO">

    
    
    
    <itemBody >
	    </itemBody>

    
    
    </assessmentItem>

ITEM_QTI;


        $item = new Item();
        $itemQti = $this->removeToolVersionAttribute($item->toQTI());

        self::assertEquals($expectedItemQti, $itemQti);
    }

    public function testToQTIWithDirAttributeInItemBody(): void
    {
        $expectedItemQti = <<<ITEM_QTI
<?xml version="1.0" encoding="UTF-8"?><assessmentItem
        xsi:schemaLocation=""
     identifier="Item_1" title="" label="" adaptive="false" timeDependent="false" toolName="TAO">

    
    
    
    <itemBody dir="rtl">
	    </itemBody>

    
    
    </assessmentItem>

ITEM_QTI;


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
}
