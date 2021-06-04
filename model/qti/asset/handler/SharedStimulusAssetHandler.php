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
use oat\taoMediaManager\model\MediaService as MediaManagerService;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoMediaManager\model\MediaSource;
use oat\taoMediaManager\model\sharedStimulus\service\StoreService;
use oat\taoMediaManager\model\SharedStimulusImporter;
use oat\taoMediaManager\model\SharedStimulusPackageImporter;
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
        $sharedFiles = $this->getSharedFiles();

        $md5 = md5_file($absolutePath);
        if (isset($sharedFiles[$md5])) {
            \common_Logger::i('Auxiliary file \'' . $absolutePath . '\' linked to shared storage.');
            return $sharedFiles[$md5];
        }

        SharedStimulusImporter::isValidSharedStimulus($absolutePath);
        $newXmlFile = SharedStimulusPackageImporter::embedAssets($absolutePath);
        $itemContent = $this->sharedStorage->add($newXmlFile, basename($relativePath), $this->parentPath);

        $assetWithCss = $this->getStoreService()->store(
            $newXmlFile,
            basename($relativePath),
            [
                dirname($absolutePath) . DIRECTORY_SEPARATOR . 'css/tao-user-styles.css'
            ]
        );

        $mediaResourceUri = $this->getMediaService()->createSharedStimulusInstance(
            $assetWithCss . DIRECTORY_SEPARATOR . basename($relativePath) ,
            'http://www.tao.lu/Ontologies/TAOMedia.rdf#Media',
            'http://www.tao.lu/Ontologies/TAO.rdf#Langen-US'
        );

//        $this->addSharedFile($md5, $itemContent);
        \common_Logger::i('Auxiliary file \'' . $absolutePath . '\' added to shared storage.');



        return [
            'uri' => MediaSource::SCHEME_NAME .  tao_helpers_Uri::encode($mediaResourceUri)
        ];
    }

    /**
     *
     * @param string $path
     * @return \core_kernel_classes_Class
     */
    private function getOrCreatePath($path)
    {
        $rootClass = $this->getRootClass();

        if ($path === '') {
            return $rootClass;
        }

        // If the path is a class URI, returns the existing class.
        $class = $this->getClass(tao_helpers_Uri::decode($path));
        if ($class->isSubClassOf($rootClass) || $class->equals($rootClass) || $class->exists()) {
            return $class;
        }

        // If the given path is a json-encoded array, creates the full path from root class.
        $labels = $this->getArrayFromJson($path);
        if ($labels) {
            return $rootClass->createSubClassPathByLabel($labels);
        }

        // Retrieve or create a direct subclass of the root class.
        return $rootClass->retrieveOrCreateSubClassByLabel($path);
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

    private function getStoreService(): StoreService
    {
        return $this->getServiceLocator()->get(StoreService::class);
    }

    private function getMediaService(): MediaManagerService
    {
        return $this->getServiceLocator()->get(MediaManagerService::class);
    }
}
