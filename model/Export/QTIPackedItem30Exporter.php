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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 * @author Julien Sébire, <julien@taotesting.com>
 */

namespace oat\taoQtiItem\model\Export;

class QTIPackedItem30Exporter extends QTIPackedItemExporter
{
    protected function renderManifest(array $options, array $qtiItemData)
    {
        $dir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
        $tpl = $dir . 'model/qti/templates/imsmanifestQti30.tpl.php';

        $templateRenderer = new \taoItems_models_classes_TemplateRenderer($tpl, [
            'qtiItems' => [$qtiItemData],
            'manifestIdentifier' => 'MANIFEST-' . \tao_helpers_Display::textCleaner(uniqid('tao', true), '-'),
        ]);

        $renderedManifest = $templateRenderer->render();
        $newManifest = new \DOMDocument('1.0', TAO_DEFAULT_ENCODING);
        $newManifest->loadXML($renderedManifest);

        return $newManifest;
    }

    protected function itemContentPostProcessing($content)
    {
        $content = str_replace(
            'http://www.imsglobal.org/xsd/imsqti_v2p1',
            'http://www.imsglobal.org/xsd/imsqti_v3p0',
            $content
        );

        $content = str_replace(
            'http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd',
            'http://www.imsglobal.org/xsd/qti/qtiv3p0/imsqti_v3p0.xsd',
            $content
        );

        $content = str_replace(
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct',
            'http://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct',
            $content
        );

        $content = str_replace(
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response',
            'http://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response',
            $content
        );

        $content = str_replace(
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response_point',
            'http://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point',
            $content
        );

        return $content;
    }
}
