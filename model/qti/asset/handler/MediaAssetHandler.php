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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\qti\asset\handler;

use oat\tao\helpers\FileUploadException;
use oat\tao\model\media\MediaManagement;
use oat\tao\model\media\MediaService;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoMediaManager\model\SharedStimulusImporter;
use oat\taoMediaManager\model\SharedStimulusPackageImporter;
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\Item;

class MediaAssetHandler extends AssetHandler
{
    /** @var  ItemMediaResolver */
    protected $itemSource;

    /** @var MediaManagement */
    protected $sharedStorage;

    const ASSET_HANDLER_QTI_MODEL = 'qtiModel';
    const ASSET_HANDLER_SHARED_FILES = 'sharedFiles';
    const ASSET_HANDLER_PARENT_PATH = 'parentPath';

    /**
     * MediaAssetHandler constructor.
     * Retrieve hared storage
     *
     * @param mixed $itemSource
     */
    public function __construct($itemSource)
    {
        $sources = MediaService::singleton()->getWritableSources();
        $this->sharedStorage = array_shift($sources);
        $this->itemSource = $itemSource;
        return $this;
    }

    /**
     * Check if current file.xml is shared stimulus
     *
     * @param $relativePath
     * @return bool
     * @throws FileUploadException
     */
    public function isApplicable($relativePath)
    {
        $xincluded = array();
        /** @var Element $xincludeElement */
        foreach ($this->getQtiModel()->getComposingElements('oat\taoQtiItem\model\qti\Xinclude') as $xincludeElement) {
            $xincluded[] = $xincludeElement->attr('href');
            \common_Logger::i("Xinclude component found in resource '" .
                $this->getQtiModel()->getIdentifier() . "' with href '" . $xincludeElement->attr('href') . "'.");
        }

        return (!empty($this->sharedStorage) && in_array($relativePath, $xincluded));
    }

    /**
     * Handle the process to manage shared stimulus files
     *
     * @param $absolutePath
     * @param $relativePath
     * @return array
     * @throws \qtism\data\storage\xml\XmlStorageException
     */
    public function handle($absolutePath, $relativePath)
    {
        $sharedFiles = $this->getSharedFiles();

        $md5 = md5_file($relativePath);
        if (isset($sharedFiles[$md5])) {
            \common_Logger::i('Auxiliary file \'' . $absolutePath . '\' linked to shared storage.');
            return $sharedFiles[$md5];
        }

        SharedStimulusImporter::isValidSharedStimulus($absolutePath);
        $newXmlFile = SharedStimulusPackageImporter::embedAssets($absolutePath);
        $itemContent = $this->sharedStorage->add($newXmlFile, basename($relativePath), $this->get(self::ASSET_HANDLER_PARENT_PATH));

        if (method_exists($this->sharedStorage, 'forceMimeType')) {
            $asset = $this->itemSource->resolve($itemContent['uri']);
            $this->sharedStorage->forceMimeType($asset->getMediaIdentifier(), 'application/qti+xml');
        }

        $this->addSharedFile($md5, $itemContent);
        \common_Logger::i('Auxiliary file \'' . $absolutePath . '\' added to shared storage.');

        return $itemContent;
    }

    /**
     * Return item of import e.q. "qti.xml"
     *
     * @return Item
     * @throws FileUploadException
     */
    protected function getQtiModel()
    {
        $qtiModel = $this->get(self::ASSET_HANDLER_QTI_MODEL);
        if ($qtiModel instanceof Item) {
            return $qtiModel;
        }
        throw new FileUploadException('Unable to found a valid Qti File.');
    }

    /**
     * Return shared files if exist, else empty array
     *
     * @return array
     */
    public function getSharedFiles()
    {
        $sharedFiles = $this->get(self::ASSET_HANDLER_SHARED_FILES);
        if ($sharedFiles) {
            return $sharedFiles;
        }
        return array();
    }

    /**
     * Add a shared file
     *
     * @param $key
     * @param $value
     * @return $this
     */
    public function addSharedFile($key, $value)
    {
        $sharedFiles = $this->getSharedFiles();
        if ($sharedFiles) {
            $sharedFiles[$key] = $value;
            $this->set(self::ASSET_HANDLER_SHARED_FILES, $sharedFiles);
        }
        return $this;
    }

}