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

namespace oat\taoQtiItem\model\qti\converter;

use DOMDocument;
use oat\oatbox\extension\exception\ManifestNotFoundException;
use taoQtiTest_models_classes_ManifestParser as ManifestParser;

class ManifestConverter
{
    private const XML_NS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
    private const NEW_MAIN_NAMESPACE = 'http://www.imsglobal.org/xsd/imscp_v1p1';
    private const XSI_NAMESPACE = 'http://www.w3.org/2001/XMLSchema-instance';
    private const IMS_MD_NAMESPACE = 'http://ltsc.ieee.org/xsd/LOM';
    private const SCHEMA_LOCATION = 'http://www.imsglobal.org/xsd/imscp_v1p1 ' .
    'http://www.imsglobal.org/xsd/qti/qtiv2p2/qtiv2p2_imscpv1p2_v1p0.xsd ' .
    'http://ltsc.ieee.org/xsd/LOM http://www.imsglobal.org/xsd/imsmd_loose_v1p3p2.xsd';
    private const QUALIFIED_NAME_NS = 'xmlns';
    private const QUALIFIED_NAME_XSI = self::QUALIFIED_NAME_NS . ':xsi';
    private const QUALIFIED_NAME_IMSMD = self::QUALIFIED_NAME_NS . ':imsmd';
    private const XSI_SCHEMA_LOCATION = 'xsi:schemaLocation';
    private const QTI3_XSD = 'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1';
    private const TEST_RESOURCE_TYPE = 'imsqti_test_xmlv3p0';
    private const ITEM_RESOURCE_TYPE = 'imsqti_item_xmlv3p0';
    private const RESOURCE_TYPE_REPLACEMENTS = [
        self::ITEM_RESOURCE_TYPE => 'imsqti_item_xmlv2p2',
        self::TEST_RESOURCE_TYPE => 'imsqti_test_xmlv2p2',
    ];

    public function convertToQti2(string $manifestFile, ManifestParser $manifestParser): void
    {
        //Check if folder exist and contains QTI 3.0 files
        if (!is_readable($manifestFile)) {
            throw new ManifestNotFoundException('Manifest not found!');
        }

        $dom = new DOMDocument();
        $dom->load($manifestFile);

        //Check if the file is QTI 3.0 using schemaversion
        if ($dom->getElementsByTagName('schemaversion')->item(0)->nodeValue !== '3.0.0') {
            return;
        }
        // Get the manifest element
        $manifestElement = $dom->getElementsByTagName('manifest')->item(0);
        if (!$manifestElement) {
            return;
        }

        // Remove existing namespace attributes
        $manifestElement->removeAttributeNS(
            self::QTI3_XSD,
            ''
        );

        // Set new main namespace
        $manifestElement->setAttributeNS(
            self::XML_NS_NAMESPACE,
            self::QUALIFIED_NAME_NS,
            self::NEW_MAIN_NAMESPACE
        );

        // Ensure xsi namespace
        $manifestElement->setAttributeNS(
            self::XML_NS_NAMESPACE,
            self::QUALIFIED_NAME_XSI,
            self::XSI_NAMESPACE
        );

        // Ensure imsmd namespace
        $manifestElement->setAttributeNS(
            self::XML_NS_NAMESPACE,
            self::QUALIFIED_NAME_IMSMD,
            self::IMS_MD_NAMESPACE
        );

        $manifestElement->setAttributeNS(
            self::XSI_NAMESPACE,
            self::XSI_SCHEMA_LOCATION,
            self::SCHEMA_LOCATION
        );

        $dom->getElementsByTagName('schemaversion')->item(0)->nodeValue = '2.2.0';
        $resources = $dom->getElementsByTagName('resource');

        foreach ($resources as $resource) {
            // If resource type is mapped replace it with mapped value
            if (isset(self::RESOURCE_TYPE_REPLACEMENTS[$resource->getAttribute('type')])) {
                $resource->setAttribute(
                    'type',
                    self::RESOURCE_TYPE_REPLACEMENTS[$resource->getAttribute('type')]
                );
            }
        }

        // Save the modified XML
        $dom->save($manifestFile);
        $manifestParser->validate();
    }
}
