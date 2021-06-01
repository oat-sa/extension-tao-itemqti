<?php

/*
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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Repository;

use oat\oatbox\service\ConfigurableService;
use oat\generis\model\GenerisRdf;
use oat\generis\model\OntologyAwareTrait;
use tao_helpers_form_elements_Htmlarea as HtmlArea;
use tao_helpers_form_elements_Textarea as TextArea;
use tao_helpers_form_elements_Textbox as TextBox;
use core_kernel_classes_Property;

class MetadataRepository extends ConfigurableService
{
    use OntologyAwareTrait;

    private const TEXT_WIDGETS = [
        TextBox::WIDGET_ID,
        TextArea::WIDGET_ID,
        HtmlArea::WIDGET_ID,
    ];

    public function findMetadataByClassUri(string $uri): array
    {
        $metaDataArray = [];
        $class = $this->getClass($uri);
        $aliasProperty = $class->getProperty(GenerisRdf::PROPERTY_ALIAS);
        $classProperties = $class->getProperties(true);

        if ($classProperties) {
            foreach ($classProperties as $property) {
                $aliasName = (string)$property->getOnePropertyValue($aliasProperty);
                if (!$property->getWidget()) {
                    continue;
                }
                if ($aliasName && $this->isTextWidget($property)) {
                    $metaDataArray[] = $property;
                }
            }
        }
        return $metaDataArray;
    }

    public function getClassName(string $uri): string
    {
        $class = $this->getClass($uri);
        return $class->getLabel();
    }

    private function isTextWidget(core_kernel_classes_Property $property): bool
    {
        $widgetUri = $property->getWidget()->getUri();
        return in_array($widgetUri, self::TEXT_WIDGETS, true);
    }
}
