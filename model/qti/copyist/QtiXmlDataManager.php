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
 * Copyright (c) 2020-2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\copyist;

use common_Exception;
use core_kernel_classes_Resource;
use core_kernel_persistence_Exception;
use DOMDocument;
use DOMElement;
use oat\generis\model\fileReference\FileReferenceSerializer;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\log\LoggerAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorProxy;
use oat\taoQtiItem\helpers\QtiFile;
use oat\oatbox\filesystem\File;
use tao_models_classes_FileNotFoundException;
use taoItems_models_classes_ItemsService;

class QtiXmlDataManager extends ConfigurableService
{
    use OntologyAwareTrait;
    use LoggerAwareTrait;

    /**
     * @var string
     */
    private $prefix;

    /**
     * All files will be copied from the previous resource
     * so our responsibility to fix everything inside these files
     *
     * @param string $sourceItemId
     * @param string $destinationItemId
     * @throws common_Exception
     * @throws core_kernel_persistence_Exception
     * @throws tao_models_classes_FileNotFoundException
     */
    public function replaceItemIdentifier(
        string $sourceItemId,
        string $destinationItemId
    ): void {
        $destinationItem = $this->getResource($destinationItemId);

        /** @var taoItems_models_classes_ItemsService $itemService */
        $itemService = $this->getServiceLocator()->get(taoItems_models_classes_ItemsService::class);
        $serializer = $this->getFileReferenceSerializer();

        foreach ($destinationItem->getUsedLanguages($itemService->getItemContentProperty()) as $lang) {
            $destinationItemDirectory = $itemService->getItemDirectory($destinationItem, $lang);

            foreach (
                $destinationItem->getPropertyValuesCollection(
                    $itemService->getItemContentProperty(),
                    ['lg' => $lang]
                )->getIterator() as $propertyValue
            ) {
                $id = $propertyValue instanceof core_kernel_classes_Resource
                    ? $propertyValue->getUri()
                    : (string) $propertyValue;
                $destinationDirectory = $serializer->unserializeDirectory($id);
                $iterator = $destinationDirectory->getFlyIterator(
                    Directory::ITERATOR_FILE | Directory::ITERATOR_RECURSIVE
                );

                foreach ($iterator as $iteratorFile) {
                    $filePath = $destinationItemDirectory->getRelPath($iteratorFile);
                    /** @var File $newFile */
                    $file = $destinationItemDirectory->getFile($filePath);

                    // do replace if needed
                    $this->replaceFileContent($file, $sourceItemId, $destinationItemId);
                }
            }
        }
    }

    /**
     * As I know that qti.xml consist of xml, and if structure is expected - just replace identifier
     * @param File $file
     * @param string $fromSourceId
     * @param string $toSourceId
     * @throws common_Exception
     */
    private function replaceFileContent(File $file, string $fromSourceId, string $toSourceId): void
    {
        if (preg_match('/' . QtiFile::FILE . '$/', $file->getBasename()) === 1) {
            $xml = $file->read();
            $dom = new DOMDocument('1.0', 'UTF-8');

            if ($dom->loadXML($xml) === true) {
                $assessmentItemNodes = $dom->getElementsByTagName('assessmentItem');
                $identifierGenerator = $this->getIdentifierGenerator();

                /** @var DOMElement $item */
                foreach ($assessmentItemNodes as $item) {
                    $identifier = $identifierGenerator->generate([
                        IdentifierGeneratorInterface::OPTION_RESOURCE_ID => $toSourceId
                    ]);

                    $item->setAttribute('identifier', $identifier);
                }
            } else {
                $this->logWarning('Qti.xml does not have a valid xml, identifier will not be replaced');
            }

            $file->put($dom->saveXML());
        }
    }

    public function setAppNamespacePrefix(string $prefix): void
    {
        $this->prefix = $prefix;
    }

    /**
     * Get serializer to persist filesystem object
     *
     * @return FileReferenceSerializer
     */
    protected function getFileReferenceSerializer(): FileReferenceSerializer
    {
        return $this->getServiceLocator()->get(FileReferenceSerializer::SERVICE_ID);
    }

    private function getIdentifierGenerator(): IdentifierGeneratorInterface
    {
        return $this->getServiceManager()->getContainer()->get(IdentifierGeneratorProxy::class);
    }
}
