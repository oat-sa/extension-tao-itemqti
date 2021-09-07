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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\compile\QtiAssetCompiler;

use common_Exception;
use oat\generis\Helper\UuidPrimaryKeyTrait;
use oat\oatbox\service\ConfigurableService;
use League\Flysystem\FileExistsException;
use oat\oatbox\filesystem\Directory;
use oat\taoQtiItem\model\Export\Stylesheet\AssetStylesheetLoader;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Stylesheet;
use Psr\Http\Message\StreamInterface;

class XIncludeAdditionalAssetInjector extends ConfigurableService
{
    use UuidPrimaryKeyTrait;

    public const XINCLUDE_ASSET_TYPE = 'xinclude';

    private const COMPILED_PASSAGE_STYLESHEET_FILENAME_PREFIX = 'passage';

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

        if ($content = $passageStylesheetLoader->loadAssetFromAssetResource(
            $packedAsset->getMediaAsset()->getMediaIdentifier()
        )) {
            try {
                $this->includeSharedStimulusStylesheet($qtiItem, $publicDirectory, $content);
            } catch (QtiModelException | FileExistsException $e) {
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
     * @throws FileExistsException
     * @throws common_Exception
     */
    private function includeSharedStimulusStylesheet(
        Item $qtiItem,
        Directory $publicDirectory,
        StreamInterface $stylesheetContent
    ): void {
        $stylesheetUrl = $this->getUniquePrimaryKey() . self::COMPILED_PASSAGE_STYLESHEET_FILENAME_PREFIX . AssetStylesheetLoader::ASSET_CSS_FILENAME;

        $publicDirectory->getFile($stylesheetUrl)->write($stylesheetContent);
        $qtiStylesheet = new Stylesheet(
            [
                'href' => $stylesheetUrl,
                'title' => AssetStylesheetLoader::ASSET_CSS_FILENAME,
                'type' => 'text/css'
            ]
        );

        $qtiItem->addStylesheet($qtiStylesheet);
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

