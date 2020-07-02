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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\compile\QtiAssetCompiler;

use DOMDocument;
use DOMElement;
use DOMXPath;
use InvalidArgumentException;
use oat\oatbox\config\ConfigurationService;
use oat\tao\model\media\MediaAsset;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;
use tao_models_classes_FileNotFoundException;

class XIncludeXmlInjector extends ConfigurationService
{
    /**
     * @param DOMDocument $domDocument
     * @param PackedAsset[] $packedAssets
     */
    public function injectSharedStimulus(DOMDocument $domDocument, array $packedAssets) : void
    {
        /** @var DOMElement $xincludeNode */
        foreach ($domDocument->getElementsByTagName('include') as $xincludeNode) {

            $sharedStimulusElement = $this->createSharedStimulusContent($xincludeNode, $packedAssets);

            $xincludeNode->parentNode->replaceChild(
                $domDocument->importNode($sharedStimulusElement, true),
                $xincludeNode
            );

        }
    }

    /**
     * @param DOMElement $xincludeNode
     * @param PackedAsset[] $packedAssets
     * @return DOMElement
     * @throws tao_models_classes_FileNotFoundException
     */
    private function createSharedStimulusContent(DOMElement $xincludeNode, array $packedAssets): DOMElement
    {
        $href = $xincludeNode->getAttribute('href');

        if (!isset($packedAssets[$href])) {
            throw new InvalidArgumentException(sprintf('SharedStimulus %s cannot be found', $href));
        }

        /** @var MediaAsset $asset */
        $asset = $packedAssets[$href]->getMediaAsset();

        $this->logInfo(sprintf('Injecting shared stimulus %s to QTI map', $asset->getMediaIdentifier()));

        $sharedStimulusContent = $asset->getMediaSource()->getFileStream($asset->getMediaIdentifier())->getContents();

        return $this->createSharedStimulusNode($sharedStimulusContent);
    }

    private function createSharedStimulusNode(string $sharedStimulusContent): DOMElement
    {
        $sharedStimulusDocument = new DOMDocument('1.0', 'UTF-8');

        if ($sharedStimulusDocument->loadXML($sharedStimulusContent) === false) {
            throw new InvalidArgumentException('SharedStimulus content is not parsable.');
        }

        $sharedStimulusXpath = new DOMXPath($sharedStimulusDocument);

        $mainElement = $sharedStimulusXpath->query('//row[@class="grid-row"]');
        if ($mainElement->count() == 0) {
            $sharedStimulusElement = $sharedStimulusDocument->firstChild;
            $sharedStimulusElement->removeAttribute('xml:lang');
        } else {
            $sharedStimulusElement = $mainElement->item(0);
        }

        return $sharedStimulusElement;
    }
}
