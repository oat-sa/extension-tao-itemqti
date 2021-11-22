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

use Laminas\ServiceManager\ServiceLocatorAwareTrait;
use oat\generis\model\OntologyAwareTrait;
use oat\tao\helpers\FileUploadException;
use oat\tao\model\media\MediaManagement;
use oat\tao\model\media\MediaService;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoMediaManager\model\sharedStimulus\encoder\SharedStimulusMediaEncoder;
use oat\taoMediaManager\model\MediaSource;
use oat\taoMediaManager\model\SharedStimulusImporter;
use oat\taoQtiItem\model\qti\asset\factory\SharedStimulusFactory;
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\Item;
use tao_helpers_Uri;

class SharedStimulusAssetHandler implements AssetHandler
{
    use OntologyAwareTrait;
    use ServiceLocatorAwareTrait;

    /** @var  ItemMediaResolver */
    protected $itemSource;

    /** @var MediaManagement */
    protected $sharedStorage;

    protected $qtiModel;
    protected $sharedFiles = [];
    protected $parentPath;

    /**
     * MediaAssetHandler constructor.
     * Retrieve shared storage
     *
     */
    public function __construct()
    {
        $sources = MediaService::singleton()->getWritableSources();
        $this->sharedStorage = array_shift($sources);
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
        $xincluded = [];
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
        SharedStimulusImporter::isValidSharedStimulus($absolutePath);
        $newXmlFile = $this->getSharedStimulusMediaEncoderService()->encodeAssets($absolutePath);
        $mediaResourceUri = $this->getSharedStimulusFactory()->createShardedStimulusFromSourceFiles(
            $newXmlFile,
            $relativePath,
            $absolutePath,
            $this->buildLabelBaseOnParentPath()
        );

        \common_Logger::i('Auxiliary file \'' . $absolutePath . '\' added to shared storage.');

        return [
            'uri' => MediaSource::SCHEME_NAME .  tao_helpers_Uri::encode($mediaResourceUri)
        ];
    }

    /**
     * Return item of import e.q. "qti.xml"
     *
     * @return Item
     * @throws FileUploadException
     */
    protected function getQtiModel()
    {
        if ($this->qtiModel) {
            return $this->qtiModel;
        }
        throw new FileUploadException('Unable to found a valid Qti File.');
    }

    /**
     * Setter of qtiModel
     *
     * @param $qtiModel
     * @return $this
     */
    public function setQtiModel($qtiModel)
    {
        $this->qtiModel = $qtiModel;
        return $this;
    }

    /**
     * Return shared files
     *
     * @return array
     */
    public function getSharedFiles()
    {
        return $this->sharedFiles;
    }

    public function setSharedFiles($sharedFiles)
    {
        $this->sharedFiles = $sharedFiles;
        return $this;
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
        $sharedFiles[$key] = $value;
        $this->setSharedFiles($sharedFiles);
        return $this;
    }

    /**
     * @return ItemMediaResolver
     */
    public function getItemSource()
    {
        return $this->itemSource;
    }

    /**
     * @param ItemMediaResolver $itemSource
     * @return $this
     */
    public function setItemSource($itemSource)
    {
        $this->itemSource = $itemSource;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getParentPath()
    {
        return $this->parentPath;
    }

    /**
     * @param mixed $parentPath
     * @return $this
     */
    public function setParentPath($parentPath)
    {
        $this->parentPath = $parentPath;
        return $this;
    }

    /**
     * @inherit
     */
    public function finalize()
    {
        // Nothing to do
    }

    private function getSharedStimulusMediaEncoderService (): SharedStimulusMediaEncoder
    {
        return $this->getServiceLocator()->get(SharedStimulusMediaEncoder::SERVICE_ID);
    }

    private function getSharedStimulusFactory(): SharedStimulusFactory
    {
        return $this->getServiceLocator()->get(SharedStimulusFactory::class);
    }

    private function buildLabelBaseOnParentPath()
    {
        $parentPath = $this->getParentPath();
        $decodedParentPath = json_decode($parentPath);

        return reset($decodedParentPath);
    }
}
