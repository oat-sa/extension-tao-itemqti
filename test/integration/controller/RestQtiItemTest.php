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
 */

namespace oat\taoQtiItem\test\integration\controller;

use oat\tao\test\integration\RestTestRunner;
use oat\taoQtiItem\model\ItemModel;
use oat\generis\model\OntologyAwareTrait;

/**
 * End point of Rest item API
 *
 * @author Absar Gilani, absar.gilani6@gmail.com
 */
class RestQtiItemTest extends RestTestRunner
{
    use OntologyAwareTrait;
    
    public function testImport()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoItems');
        $url = $this->host.'taoQtiItem/RestQtiItem/import';
        $post_data = [
            'content' => new \CURLFile(__DIR__.'/../samples/package/QTI/package.zip', 'application/zip')
        ];

        $return = $this->curl($url, CURLOPT_POST, 'data', array(CURLOPT_POSTFIELDS => $post_data));
        $data = json_decode($return, true);
        $this->assertInternalType('array', $data);
        $this->assertTrue(isset($data['success']));
        $this->assertTrue($data['success']);
        $this->assertTrue(isset($data['data']['items']));
        $items = $data['data']['items'];
        $this->assertInternalType('array', $items);
        $this->assertEquals(1, count($items));
        $itemUri = reset($items);
        $this->assertInternalType('string', $itemUri);
        $item = $this->getResource($itemUri);
        $this->assertTrue($item->exists());
        
        $itemService = \taoItems_models_classes_ItemsService::singleton();
        $model = $itemService->getItemModel($item);
        $this->assertNotNull($model);
        $this->assertEquals(ItemModel::MODEL_URI, $itemService->getItemModel($item)->getUri());
        
        $this->assertTrue($itemService->deleteResource($item));
        $this->assertFalse($item->exists());
    }
    
    public function testCreateQtiItem()
    {
        $url = $this->host.'taoQtiItem/RestQtiItem/createQtiItem';
        $return = $this->curl($url, CURLOPT_POST, 'data', array(CURLOPT_POSTFIELDS => array()));
        $data = json_decode($return, true);
        
        $this->assertInternalType('array', $data);
        $this->assertTrue(isset($data['success']));
        $this->assertTrue($data['success']);
        $this->assertTrue(isset($data['data']));
        $itemUri = $data['data'];
        $this->assertInternalType('string', $itemUri);
        $item = $this->getResource($itemUri);
        $this->assertTrue($item->exists());
        
        $itemService = \taoItems_models_classes_ItemsService::singleton();
        $model = $itemService->getItemModel($item);
        $this->assertNotNull($model);
        $this->assertEquals(ItemModel::MODEL_URI, $itemService->getItemModel($item)->getUri());
        
        $this->assertTrue($itemService->deleteResource($item));
        $this->assertFalse($item->exists());
    }
}