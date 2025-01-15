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
 * Copyright (c) 2015-2024 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\model;

use oat\oatbox\service\ConfigurableService;

class ValidationService extends ConfigurableService
{
    public const SERVICE_ID = 'taoQtiItem/validation';

    private $contentValidation = [
        'http://www.imsglobal.org/xsd/imsqti_v2p0' => [
            '/qti/data/qtiv2p0/imsqti_v2p0.xsd'
        ],
        'http://www.imsglobal.org/xsd/apip/apipv1p0/qtiitem/imsqti_v2p1' => [
            '/qti/data/apipv1p0/Core_Level/Package/apipv1p0_qtiitemv2p1_v1p0.xsd'
        ],
        'http://www.imsglobal.org/xsd/apip/apipv1p0/qtiitem/imsqti_v2p2' => [
            '/qti/data/apipv1p0final/Core_Level/Package/apipv1p0_qtiitemv2p2_v1p0.xsd'
        ],
        'http://www.imsglobal.org/xsd/imsqti_v2p2' => [
            '/qti/data/qtiv2p2p4/imsqti_v2p2p4.xsd'
        ],
        'http://www.imsglobal.org/xsd/imsqtiasi_v3p0' => [
            '/qti/data/qtiv3p0/imsqti_asiv3p0_v1p0.xsd'
        ],
        'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1' => [
            '/qti/data/qtiv3p0/imsqtiv3p0_imscpv1p2_v1p0.xsd'
        ],
        'http://www.imsglobal.org/xsd/imscp_v1p1' => [
            '/qti/data/imscp_v1p1.xsd'
        ],
        'default' => [
            '/qti/data/qtiv2p1p1/imsqti_v2p1p1.xsd'
        ]
    ];

    private $manifestValidation = [
        'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1' => [
            '/qti/data/imscp_v1p1.xsd',
            '/qti/data/qtiv3p0/imsqtiv3p0_imscpv1p2_v1p0.xsd'
        ],
        'default' => [
            '/qti/data/imscp_v1p1.xsd',
            '/qti/data/qtiv2p2/qtiv2p2_imscpv1p2_v1p0.xsd',
            '/qti/data/apipv1p0/Core_Level/Package/apipv1p0_imscpv1p2_v1p0.xsd',
            '/qti/data/apipv1p0final/Core_Level/Package/apipv1p0_imscpv1p2_v1p0.xsd',
            '/qti/data/qtiv3p0/imsqtiv3p0_imscpv1p2_v1p0.xsd'
        ],
        'http://www.imsglobal.org/xsd/imscp_v1p1' => [
            '/qti/data/imscp_v1p1.xsd'
        ],
    ];

    public function __construct(array $options = [])
    {
        parent::__construct($options);
        foreach ($this->contentValidation as $key => &$array) {
            foreach ($array as &$value) {
                $value = __DIR__ . $value;
            }
        }
        foreach ($this->manifestValidation as $key => &$array) {
            foreach ($array as &$value) {
                $value = __DIR__ . $value;
            }
        }
    }

    /**
     * @param string $key the namespace of content to validate
     * @return array of schema for content validation
     */
    public function getContentValidationSchema($key)
    {
        $validationArray = $this->getContentValidation();

        return $this->getSchemas($validationArray, $key);
    }

    /**
     * @param string $key the namespace of manifest to validate
     * @return array of schema for manifest validation
     */
    public function getManifestValidationSchema($key)
    {
        $validationArray = $this->getManifestValidation();

        return $this->getSchemas($validationArray, $key);
    }

    /**
     * @param array $validationArray list of xsds for namespaces
     * @param string $key the namespace
     * @return array schemas for validation
     */
    protected function getSchemas($validationArray, $key)
    {
        if (isset($validationArray[$key])) {
            return $validationArray[$key];
        }

        return $validationArray['default'];
    }

    /**
     * @return array
     */
    protected function getContentValidation()
    {
        return $this->contentValidation;
    }

    /**
     * @return array
     */
    protected function getManifestValidation()
    {
        return $this->manifestValidation;
    }
}
