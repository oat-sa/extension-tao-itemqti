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

use InvalidArgumentException;
use oat\oatbox\config\ConfigurationService;
use oat\oatbox\filesystem\Directory;
use oat\tao\model\media\sourceStrategy\HttpSource;
use oat\tao\model\media\sourceStrategy\InlineSource;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\compile\QtiAssetReplacer\QtiItemAssetReplacer;
use oat\taoQtiItem\model\compile\QtiItemCompilerAssetBlacklist;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;
use oat\taoQtiItem\model\qti\AssetParser;
use oat\taoQtiItem\model\qti\exception\XIncludeException;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\XIncludeLoader;

class QtiItemAssetCompiler extends ConfigurationService
{
    /**
     * @param Item $qtiItem
     * @param Directory $publicDirectory
     * @param ItemMediaResolver $resolver
     * @return PackedAsset[]
     * @throws XIncludeException
     * @throws \common_Exception
     */
    public function extractAndCopyAssetFiles(
        Item $qtiItem,
        Directory $publicDirectory,
        ItemMediaResolver $resolver
    ): array {
        $assetParser = new AssetParser($qtiItem, $publicDirectory);
        $assetParser->setGetSharedLibraries(false);
        $assetParser->setGetXinclude(true);

        $xincludeLoader = new XIncludeLoader($qtiItem, $resolver);
        $xincludeLoader->load();

        $packedAssets = [];
        foreach ($assetParser->extract() as $type => $assets) {
            foreach ($assets as $key => $assetUrl) {
                if ($this->isBlacklisted($assetUrl)) {
                    continue;
                }
                $packedAsset = $this->resolve($resolver, $assetUrl, $type);
                $replacement = $this->getReplacementName($packedAsset);
                $packedAsset->setReplacedBy($replacement);

                if ($this->isInlineAssetAndShouldNotBeReplaced($packedAsset)) {
                    continue;
                }
                $this->getXIncludeAdditionalAssetInjector()->injectNonRDFXincludeRelatedAssets(
                    $qtiItem,
                    $publicDirectory,
                    $packedAsset
                );

                if ($type != 'xinclude') {
                    if ($this->getQtiItemAssetReplacer()->shouldBeReplaced($packedAsset)) {
                        $packedAsset = $this->replaceWithExternalSource($packedAsset, $qtiItem);
                    } else {
                        $this->copyAssetFileToPublicDirectory($publicDirectory, $packedAsset);
                    }
                }
                $packedAssets[$assetUrl] = $packedAsset;
            }
        }

        return $packedAssets;
    }

    private function replaceWithExternalSource(PackedAsset $packedAsset, Item $qtiItem): PackedAsset
    {
        $qtiItemAssetReplacer = $this->getQtiItemAssetReplacer();
        return $qtiItemAssetReplacer->replace(
            $packedAsset,
            $qtiItem->getIdentifier()
        );
    }

    private function isBlacklisted(string $assetUrl): bool
    {
        return $this->getServiceLocator()
            ->get(QtiItemCompilerAssetBlacklist::SERVICE_ID)
            ->isBlacklisted($assetUrl);
    }

    private function resolve(ItemMediaResolver $resolver, string $assetUrl, string $type): PackedAsset
    {
        $mediaAsset = $resolver->resolve($assetUrl);
        $mediaSource = $mediaAsset->getMediaSource();

        if ($mediaSource instanceof HttpSource || $mediaSource instanceof InlineSource) {
            return new PackedAsset($type, $mediaAsset, $assetUrl);
        }

        $fileInfo = $mediaSource->getFileInfo($mediaAsset->getMediaIdentifier());
        if (isset($fileInfo['link'])) {
            $link = $fileInfo['link'];
        } elseif (isset($fileInfo['filePath'])) {
            $link = $fileInfo['filePath'];
        } else {
            throw new InvalidArgumentException(sprintf('Item asset %s cannot be resolved.', $assetUrl));
        }

        return new PackedAsset($type, $mediaAsset, $link);
    }

    private function getReplacementName(PackedAsset $packedAsset): string
    {
        $link = $packedAsset->getMediaAsset()->getMediaIdentifier();
        return uniqid() . '_' . $packedAsset->getMediaAsset()->getMediaSource()->getBaseName($link);
    }

    private function copyAssetFileToPublicDirectory(Directory $publicDirectory, PackedAsset $packedAsset): bool
    {
        $mediaAsset = $packedAsset->getMediaAsset();
        $mediaSource = $mediaAsset->getMediaSource();

        $content = $mediaSource->getFileStream($mediaAsset->getMediaIdentifier());

        $this->logInfo(sprintf(
            'Copying %s reference %s to file %s',
            $packedAsset->getType(),
            $mediaAsset->getMediaIdentifier(),
            $packedAsset->getReplacedBy()
        ));

        return $publicDirectory->getFile($packedAsset->getReplacedBy())->write($content);
    }

    private function getQtiItemAssetReplacer(): QtiItemAssetReplacer
    {
        return $this->getServiceLocator()->get(QtiItemAssetReplacer::SERVICE_ID);
    }

    private function getXIncludeAdditionalAssetInjector(): XIncludeAdditionalAssetInjector
    {
        return $this->getServiceLocator()->get(XIncludeAdditionalAssetInjector::class);
    }

    private function isInlineAssetAndShouldNotBeReplaced(PackedAsset $packedAsset): bool
    {
        return $packedAsset->getMediaAsset()->getMediaSource() instanceof InlineSource
            && !$this->getQtiItemAssetReplacer()->shouldBeReplaced($packedAsset);
    }
}
