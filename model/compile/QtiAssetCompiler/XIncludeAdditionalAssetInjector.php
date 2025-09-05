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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\compile\QtiAssetCompiler;

use common_Exception;
use oat\generis\Helper\UuidPrimaryKeyTrait;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\filesystem\Directory;
use oat\taoQtiItem\model\Export\Stylesheet\AssetStylesheetLoader;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Stylesheet;
use oat\taoQtiItem\model\qti\XInclude;

class XIncludeAdditionalAssetInjector extends ConfigurableService
{
    use UuidPrimaryKeyTrait;

    public const XINCLUDE_ASSET_TYPE = 'xinclude';

    public const COMPILED_PASSAGE_STYLESHEET_FILENAME_PREFIX = 'passage';

    public const WRAPPER_CSS_CLASS_PREFIX = 'tao-';

    /**
     * @throws common_Exception
     */
    public function injectNonRDFXincludeRelatedAssets(
        Item $qtiItem,
        Directory $publicDirectory,
        PackedAsset $packedAsset
    ): void {
        if ($this->packedAssetTypeIsNotXinclude($packedAsset)) {
            return;
        }

        $passageStylesheetLoader = $this->getAssetStylesheetLoader();
        $passageResourceIdentifier = $packedAsset->getMediaAsset()->getMediaIdentifier();
        $xInclude = $this->findQtiXIncludeByResourceIdentifierOrHref($qtiItem, $passageResourceIdentifier);

        if ($stylesheetFiles = $passageStylesheetLoader->loadAssetsFromAssetResource($passageResourceIdentifier)) {
            try {
                $this->includeSharedStimulusStylesheets($qtiItem, $publicDirectory, $stylesheetFiles, $xInclude);
            } catch (QtiModelException $e) {
                $this->logWarning(
                    sprintf(
                        'Compilation: Injecting stylesheet for Passage %s failed with message %s',
                        $packedAsset->getReplacedBy(),
                        $e->getMessage()
                    )
                );
            }
        }
    }

    /**
     * @throws QtiModelException
     * @throws common_Exception
     */
    private function includeSharedStimulusStylesheets(
        Item $qtiItem,
        Directory $publicDirectory,
        array $stylesheetFiles,
        ?XInclude $XInclude
    ): void {
        $prefix = self::COMPILED_PASSAGE_STYLESHEET_FILENAME_PREFIX;
        if ($XInclude) {
            $prefix = $this->getPassageWrapperStyleClass($XInclude);
        }
        $stylesheetTargetPubDirectory = implode(DIRECTORY_SEPARATOR, [
            $prefix,
            AssetStylesheetLoader::ASSET_CSS_DIRECTORY_NAME
        ]);

        foreach ($stylesheetFiles as $stylesheetFile) {
            $targetPath = implode(DIRECTORY_SEPARATOR, [
                $stylesheetTargetPubDirectory,
                basename($stylesheetFile['path'])
            ]);

            $publicDirectory->getFile($targetPath)->write($stylesheetFile['stream']);

            $qtiStylesheet = new Stylesheet(
                [
                    'href' => $targetPath,
                    'title' => basename($stylesheetFile['path']),
                    'type' => 'text/css'
                ]
            );

            $qtiItem->addStylesheet($qtiStylesheet);
        }
    }

    private function findQtiXIncludeByResourceIdentifierOrHref(Item $qtiItem, string $resourceId): ?XInclude
    {
        foreach ($qtiItem->getComposingElements() as $element) {
            if ($element instanceof XInclude && strpos($element->getAttributeValue('href'), $resourceId) !== false) {
                return $element;
            }
        }

        return null;
    }

    private function getPassageWrapperStyleClass(XInclude $xInclude): ?string
    {
        $existingClassAttr = $xInclude->getAttributeValue('class');
        if ($existingClassAttr) {
            return $existingClassAttr;
        }


        /* generate unique wrapper class as we do on FE */
        $generatedClass = self::WRAPPER_CSS_CLASS_PREFIX . bin2hex(random_bytes(6));
        $xInclude->setAttribute('class', $generatedClass);

        return $generatedClass;
    }

    private function packedAssetTypeIsNotXinclude(PackedAsset $packedAsset): bool
    {
        return $packedAsset->getType() !== self::XINCLUDE_ASSET_TYPE;
    }

    private function getAssetStylesheetLoader(): AssetStylesheetLoader
    {
        return $this->getServiceLocator()->get(AssetStylesheetLoader::class);
    }
}
