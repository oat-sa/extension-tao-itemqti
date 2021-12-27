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
 *               2013-2016 (update and modification) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\Export;

use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\qti\exception\ExportException;
use oat\taoQtiItem\model\qti\Service;
use \core_kernel_classes_Resource;
use \ZipArchive;
use \DOMDocument;
use \tao_helpers_Uri;
use \taoItems_models_classes_TemplateRenderer;
use \tao_helpers_Display;
use \common_Exception;

class QTIPackedItemExporter extends AbstractQTIItemExporter
{

    private $manifest;

    /**
     * Creates a new instance of QtiPackedItemExporter for a particular item.
     *
     * @param core_kernel_classes_Resource $item The item to be exported.
     * @param ZipArchive $zip The ZIP archive were the files have to be exported.
     * @param DOMDocument $manifest A Manifest to be reused to reference item components (e.g. auxilliary files).
     */
    public function __construct(core_kernel_classes_Resource $item, ZipArchive $zip, DOMDocument $manifest = null)
    {
        parent::__construct($item, $zip);
        $this->setManifest($manifest);
    }

    public function getManifest()
    {
        return $this->manifest;
    }

    public function setManifest(DOMDocument $manifest = null)
    {
        $this->manifest = $manifest;
    }

    public function hasManifest()
    {
        return $this->getManifest() !== null;
    }

    public function export($options = [])
    {
        if (!$this->containsItem()) {
            $report = parent::export($options);
            if ($report->getType() !== \common_report_Report::TYPE_ERROR || !$report->containsError()) {
                try {
                    $exportResult = [];
                    if (is_array($report->getData())) {
                        $exportResult = $report->getData();
                    }
                    $this->exportManifest($options, $exportResult);
                } catch (ExportException $e) {
                    $report->setType(\common_report_Report::TYPE_ERROR);
                    $report->setMessage($e->getUserMessage());
                }
            }
            return $report;
        }
        return \common_report_Report::createSuccess();
    }

    /**
     * Whenever the item is already in the manifest
     * @return boolean
     */
    protected function containsItem()
    {
        $found = false;
        if ($this->hasManifest()) {
            foreach ($this->getManifest()->getElementsByTagName('resource') as $resourceNode) {
                /** @var \DOMElement $resourceNode */
                if ($resourceNode->getAttribute('identifier') == $this->buildIdentifier()) {
                    $found = true;
                    break;
                }
            }
        }
        return $found;
    }

    public function buildBasePath()
    {
        return tao_helpers_Uri::getUniqueId($this->getItem()->getUri());
    }

    public function buildIdentifier()
    {
        return tao_helpers_Uri::getUniqueId($this->getItem()->getUri());
    }

    /**
     * Build, merge and export the IMS Manifest into the target ZIP archive.
     *
     * @throws
     */
    public function exportManifest($options = [], $exportResult = [])
    {

        $base = $this->buildBasePath();
        $zipArchive = $this->getZip();
        $qtiFile = '';
        $qtiResources = [];
        $sharedAssets = isset($exportResult['portableAssets']) ? $exportResult['portableAssets'] : [];

        for ($i = 0; $i < $zipArchive->numFiles; $i++) {
            $fileName = $zipArchive->getNameIndex($i);

            //shared assets are authorized to be added at the root of the package
            if (preg_match("@^" . preg_quote($base) . "@", $fileName) || in_array($fileName, $sharedAssets)) {
                if (basename($fileName) == 'qti.xml') {
                    $qtiFile = $fileName;
                } else {
                    if (!empty($fileName)) {
                        $qtiResources[] = htmlspecialchars($fileName, ENT_QUOTES|ENT_XML1);
                    }
                }
            }
        }

        $qtiItemService = Service::singleton();

        //@todo add support of multi language packages
        $rdfItem = $this->getItem();
        $qtiItem = $qtiItemService->getDataItemByRdfItem($rdfItem);

        if (!is_null($qtiItem)) {
            // -- Prepare data transfer to the imsmanifest.tpl template.
            $qtiItemData = [];

            // alter identifier for export to avoid any "clash".
            $qtiItemData['identifier'] = $this->buildIdentifier();
            $qtiItemData['filePath'] = $qtiFile;
            $qtiItemData['medias'] = $qtiResources;
            $qtiItemData['adaptive'] = ($qtiItem->getAttributeValue('adaptive') === 'adaptive') ? true : false;
            $qtiItemData['timeDependent'] = ($qtiItem->getAttributeValue('timeDependent') === 'timeDependent') ? true : false;
            $qtiItemData['toolName'] = $qtiItem->getAttributeValue('toolVendor');
            $qtiItemData['toolVersion'] = $qtiItem->getAttributeValue('toolVersion');
            $qtiItemData['interactions'] = [];

            foreach ($qtiItem->getInteractions() as $interaction) {
                $interactionData = [];
                $interactionData['type'] = $interaction->getQtiTag();
                $qtiItemData['interactions'][] = $interactionData;
            }

            // -- Build a brand new IMS Manifest.
            $newManifest = $this->renderManifest($options, $qtiItemData);

            if ($this->hasManifest()) {
                // Merge old manifest and new one.
                $dom1 = $this->getManifest();
                $dom2 = $newManifest;
                $resourceNodes = $dom2->getElementsByTagName('resource');
                $resourcesNodes = $dom1->getElementsByTagName('resources');

                foreach ($resourcesNodes as $resourcesNode) {
                    foreach ($resourceNodes as $resourceNode) {
                        $newResourceNode = $dom1->importNode($resourceNode, true);
                        $resourcesNode->appendChild($newResourceNode);
                    }
                }


                // rendered manifest is now useless.
                unset($dom2);
            } else {
                // Brand new manifest.
                $this->setManifest($newManifest);
            }

            $manifest = $this->getManifest();
            $this->getMetadataExporter()->export($this->getItem(), $manifest);
            $this->setManifest($manifest);


            // -- Overwrite manifest in the current ZIP archive.
            $zipArchive->addFromString('imsmanifest.xml', $this->getManifest()->saveXML());
        } else {
            //the item has no item content, there are 2 possibilities:
            $itemLabel = $this->getItem()->getLabel();
            if (empty($itemLabel)) {
                //it has no label at all: the item does not exist anymore
                throw new ExportException($this->getItem()->getUri(), 'item not found');
            } else {
                //there is one, so the item does exist but might not have any content
                throw new ExportException($itemLabel, 'no item content');
            }
        }
    }

    protected function renderManifest(array $options, array $qtiItemData)
    {
        $asApip = isset($options['apip']) && $options['apip'] === true;
        $dir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
        $tpl = ($asApip === false) ? $dir . 'model/qti/templates/imsmanifest.tpl.php' : $dir . 'model/qti/templates/imsmanifestApip.tpl.php';

        $templateRenderer = new taoItems_models_classes_TemplateRenderer($tpl, [
            'qtiItems' => [$qtiItemData],
            'manifestIdentifier' => 'MANIFEST-' . tao_helpers_Display::textCleaner(uniqid('tao', true), '-')
        ]);

        $renderedManifest = $templateRenderer->render();
        $newManifest = new DOMDocument('1.0', TAO_DEFAULT_ENCODING);
        $newManifest->loadXML($renderedManifest);

        return $newManifest;
    }

    protected function itemContentPostProcessing($content)
    {
        return $content;
    }
}
