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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Service;

use oat\oatbox\service\ConfigurableService;
use \DOMDocument;
use oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Exceptions\ReplacementException;

class QtiItemAssetReplacerService extends ConfigurableService implements QtiItemAssetReplacerServiceInterface
{
    public function getType(): int
    {
        return $this->getOption(QtiItemAssetReplacerServiceInterface::OPTION_TYPE);
    }

    public function replaceLinksInXML(DOMDocument $dom, array $packedAssets): DOMDocument
    {
        $replacers = [];

        if ($this->getType() === QtiItemAssetReplacerServiceInterface::TYPE_SINGLE) {
            /** @var QtiItemAssetReplacerServiceInterface $callable */
            $replacers[] = $this->getOption(QtiItemAssetReplacerServiceInterface::OPTION_CALLABLE);
        } else {
            $replacers = $this->getOption(QtiItemAssetReplacerServiceInterface::OPTION_CALLABLE_CHAIN);
        }

        /** @var QtiItemAssetReplacerServiceInterface $callable */
        foreach ($replacers as $replacer) {
            try {
                $dom = $this->callReplacer($replacer, $dom, $packedAssets);
            } catch (\Throwable $e) {
                $this->logError(
                    sprintf(
                        'Error occurred while trying to call qti item asset replacer `%s`',
                        get_class($replacer)
                    )
                );
            }
        }

        return $dom;
    }

    private function callReplacer($replacer, DOMDocument $dom, array $packedAssets): DOMDocument
    {
        $this->logInfo(
            sprintf(
                'Going to replace asset link with `%s` replacer.%sItem XML: `%s`.',
                get_class($replacer),
                PHP_EOL,
                $dom->saveXML()
            )
        );

        try {
            $dom = $replacer->replace($dom, $packedAssets);
        } catch (ReplacementException $e) {
            $this->logError(
                sprintf(
                    "Failed to replace asset link in `%s` replacer.%sItem XML: `%s`.%sTrace: `%s`",
                    get_class($replacer),
                    PHP_EOL,
                    $dom->saveXML(),
                    PHP_EOL,
                    $e->getTraceAsString()
                )
            );
        } catch (\Throwable $e) {
            $this->logError(
                sprintf(
                    'Unexpected error occured in `%s` at `%d`%sItem XML: `%s`.%sTrace: `%s`',
                    $e->getFile(),
                    $e->getLine(),
                    PHP_EOL,
                    $dom->saveXML(),
                    PHP_EOL,
                    $e->getTraceAsString()
                )
            );
        }

        return $dom;
    }
}
