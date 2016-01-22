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
 */

namespace oat\taoQtiItem\model;

use common_Logger;
use common_report_Report;
use core_kernel_classes_Resource;
use oat\taoQtiItem\model\pack\QtiItemPacker;
use oat\taoQtiItem\model\qti\exception\XIncludeException;
use oat\taoQtiItem\model\qti\Service;
use tao_helpers_File;
use taoItems_models_classes_ItemsService;
use oat\taoQtiItem\model\qti\Parser;

/**
 * The QTI Json Item Compiler
 *
 * @access public
 * @author Antoine Robin
 * @package taoItems
 */
class QtiJsonItemCompiler extends QtiItemCompiler
{

    const ITEM_FILE_NAME = 'item.json';

    /**
     * Desploy all the required files into the provided directories
     *
     * @param core_kernel_classes_Resource $item
     * @param string $language
     * @param string $publicDirectory
     * @param string $privateFolder
     * @return common_report_Report
     */
    protected function deployQtiItem(core_kernel_classes_Resource $item, $language, $publicDirectory, $privateFolder)
    {
        //start debugging here
        common_Logger::d('destination original ' . $publicDirectory . ' ' . $privateFolder);

        $qtiService = Service::singleton();


        //copy client side resources (javascript loader)
        $qtiItemDir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
        $taoDir = \common_ext_ExtensionsManager::singleton()->getExtensionById('tao')->getDir();
        $assetPath = $qtiItemDir . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR . 'runtime' . DIRECTORY_SEPARATOR;
        $assetLibPath = $taoDir . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR;
        if (\tao_helpers_Mode::is('production')) {
            tao_helpers_File::copy($assetPath . 'qtiLoader.min.js', $publicDirectory . 'qtiLoader.min.js', false);
        } else {
            tao_helpers_File::copy($assetPath . 'qtiLoader.js', $publicDirectory . 'qtiLoader.js', false);
            tao_helpers_File::copy($assetLibPath . 'require.js', $publicDirectory . 'require.js', false);
        }

        // retrieve the media assets
        try {
            $qtiItem = $this->retrieveAssets($item, $language, $publicDirectory);

            //create the item.json file in private directory
            $itemPacker = new QtiItemPacker();
            $itemPack = $itemPacker->packQtiItem($item, $language, $qtiItem);
            file_put_contents($privateFolder.self::ITEM_FILE_NAME, json_encode($itemPack->JsonSerialize()));

            //store variable qti elements data into the private directory
            $variableElements = $qtiService->getVariableElements($qtiItem);
            $serializedVariableElements = json_encode($variableElements);
            file_put_contents($privateFolder . 'variableElements.json', $serializedVariableElements);

            return new common_report_Report(
                common_report_Report::TYPE_SUCCESS, __('Successfully compiled "%s"', $language)
            );
        } catch (\tao_models_classes_FileNotFoundException $e) {
            return new common_report_Report(
                common_report_Report::TYPE_ERROR, __('Unable to retrieve asset "%s"', $e->getFilePath())
            );
        } catch (XIncludeException $e){
            return new common_report_Report(
                common_report_Report::TYPE_ERROR, $e->getUserMessage()
            );
        } catch (\Exception $e){
            return new common_report_Report(
                common_report_Report::TYPE_ERROR, $e->getMessage()
            );
        }
    }

}
