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
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 *               2013- (update and modification) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */
namespace oat\taoQtiItem\model\Export;

use core_kernel_classes_Property;
use DOMDocument;
use DOMXPath;
use taoItems_models_classes_ItemExporter;
use oat\taoQtiItem\model\qti\AssetParser;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\qti\Service;

abstract class AbstractQTIItemExporter extends taoItems_models_classes_ItemExporter
{

    abstract public function buildBasePath();

    /**
     * Overriden export from QTI items.
     *
     * @param array $options An array of options.
     * @see taoItems_models_classes_ItemExporter::export()
     */
    public function export($options = array())
    {
        $lang = \common_session_SessionManager::getSession()->getDataLanguage();
        $basePath = $this->buildBasePath();
        
        $dataFile = (string) $this->getItemModel()->getOnePropertyValue(new core_kernel_classes_Property(TAO_ITEM_MODEL_DATAFILE_PROPERTY));
        $content = $this->getItemService()->getItemContent($this->getItem());
        $resolver = new ItemMediaResolver($this->getItem(), $lang);
        
        // get the local resources and add them
        foreach ($this->getAssets($this->getItem(), $lang) as $assetUrl) {
            $mediaAsset = $resolver->resolve($assetUrl);
            $mediaSource = $mediaAsset->getMediaSource();
            if (!in_array(get_class($mediaSource), array('oat\tao\model\media\sourceStrategy\HttpSource','oat\tao\model\media\sourceStrategy\Base64Source'))) {
                $srcPath = $mediaSource->download($mediaAsset->getMediaIdentifier());
                $fileInfo = $mediaSource->getFileInfo($mediaAsset->getMediaIdentifier());
                $destPath = \tao_helpers_File::getSafeFileName(ltrim($fileInfo['name'],'/'));
                if (file_exists($srcPath)) {
                    $this->addFile($srcPath, $basePath. '/'.$destPath);
                    $content = str_replace($assetUrl, $destPath, $content);
                } else {
                    throw new \Exception('Missing resource '.$srcPath);
                }
            }
        }
        
        // add xml file
        $this->getZip()->addFromString($basePath . '/' . $dataFile, $content);

    }
    
    protected function getAssets(\core_kernel_classes_Resource $item, $lang)
    {
        $qtiItem = Service::singleton()->getDataItemByRdfItem($item, $lang);
        $assetParser = new AssetParser($qtiItem);
        $returnValue = array();
        foreach($assetParser->extract() as $type => $assets) {
            foreach($assets as $assetUrl) {
                $returnValue[] = $assetUrl;
            }
        }
        return $returnValue;
    }
}
