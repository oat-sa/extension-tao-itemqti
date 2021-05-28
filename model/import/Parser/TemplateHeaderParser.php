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

namespace oat\taoQtiItem\model\import\Parser;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\TemplateInterface;
use tao_helpers_form_elements_Htmlarea as HtmlArea;
use tao_helpers_form_elements_Textarea as TextArea;
use tao_helpers_form_elements_Textbox as TextBox;
use oat\generis\model\GenerisRdf;

class TemplateHeaderParser extends ConfigurableService
{
    private const TEXT_WIDGETS = [
        TextBox::WIDGET_ID,
        TextArea::WIDGET_ID,
        HtmlArea::WIDGET_ID,
    ];

    public function parse(TemplateInterface $template, array $metaDataArray): array
    {
        $headers = [];
        $csvColumns = $template->getDefinition()['columns'] ?? [];
        foreach ($csvColumns as $key => $val) {
            if (strpos($key, "_score") !== false) {
                for ($i = 1; $i <= 4; $i++) {
                    $headers[] = "choice_" . $i . "_score";
                }
                continue;
            }
            if (strpos($key, "choice_") !== false) {
                for ($i = 1; $i <= 4; $i++) {
                    $headers[] = "choice_" . $i;
                }
                continue;
            }
            if (strpos($key, "metadata") !== false) {
                continue;
            }
            $headers[] = $key;
        }

        if (isset($metaDataArray)) {
            foreach ($metaDataArray as $property) {
                $aliasProperty       = $property->getProperty(GenerisRdf::PROPERTY_ALIAS);
                $aliasName = (string)$property->getOnePropertyValue($aliasProperty);
                if ($this->isTextWidget($property)) {
                    $headers[] = "metadata_" . $property->getLabel() . "_" . $aliasName;
                }
            }
        }
        return $headers;
    }

    /**
     * Check whether it is a text widget
     * @return bool
     */
    private function isTextWidget($property): bool
    {
        $widgetUri = $property->getWidget()->getUri();
        return ($widgetUri)
            ? in_array($widgetUri, self::TEXT_WIDGETS, true)
            : false;
    }
}
