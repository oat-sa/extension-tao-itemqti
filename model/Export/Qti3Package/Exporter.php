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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\Export\Qti3Package;

use common_ext_ExtensionsManager;
use core_kernel_classes_Resource;
use DOMDocument;
use oat\taoQtiItem\model\Export\QTIPackedItemExporter;
use tao_helpers_Display;
use taoItems_models_classes_TemplateRenderer as TemplateRenderer;
use ZipArchive;

class Exporter extends QTIPackedItemExporter
{

    private const QTI_SCHEMA_NAMESPACE = 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0';
    private const XML_SCHEMA_INSTANCE = 'http://www.w3.org/2001/XMLSchema-instance';
    private const XSI_SCHEMA_LOCATION = 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0';
    private const XSI_SCHEMA_LOCATION_XSD = 'https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd';

    private TransformationService $transformationService;

    public function __construct(core_kernel_classes_Resource $item, ZipArchive $zip, DOMDocument $manifest = null)
    {
        parent::__construct($item, $zip, $manifest);
        $this->transformationService = new TransformationService();
    }

    /**
     * @throws \common_ext_ExtensionException
     * @throws \Exception
     */
    protected function renderManifest(array $options, array $qtiItemData): DOMDocument
    {
        $tpl = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir()
            . 'model/qti/templates/imsmanifestQti30.tpl.php';

        $templateRenderer = new TemplateRenderer(
            $tpl,
            [
                'qtiItems' => [$qtiItemData],
                'manifestIdentifier' => 'MANIFEST-' .
                    tao_helpers_Display::textCleaner(uniqid('tao', true), '-')
            ]
        );

        $newManifest = new DOMDocument('1.0', TAO_DEFAULT_ENCODING);
        $newManifest->loadXML($templateRenderer->render());

        return $newManifest;
    }

    public function getQTIVersion(): string
    {
        return '3p0';
    }


    /**
     * @throws \DOMException
     */
    protected function itemContentPostProcessing($content): string
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadXML($content);

        $content = $this->transformationService->cleanNamespaces($content);

        $dom->loadXML($content);

        $newDom = new DOMDocument('1.0', 'UTF-8');
        $newDom->preserveWhiteSpace = false;
        $newDom->formatOutput = true;

        $oldRoot = $dom->documentElement;
        $newRoot = $newDom->createElement($this->transformationService->getElementName($oldRoot));

        //QTI3 namespace
        $newRoot->setAttribute('xmlns', self::QTI_SCHEMA_NAMESPACE);
        $newRoot->setAttribute('xmlns:xsi', self::XML_SCHEMA_INSTANCE);
        $newRoot->setAttribute('xsi:schemaLocation',
            sprintf('%s %s', self::XSI_SCHEMA_LOCATION, self::XSI_SCHEMA_LOCATION_XSD)
        );

        $this->transformationService->transformAttributes($oldRoot, $newRoot);

        $newDom->appendChild($newRoot);

        $this->transformationService->transformChildren($oldRoot, $newRoot, $newDom);

        return $newDom->saveXML();
    }
}