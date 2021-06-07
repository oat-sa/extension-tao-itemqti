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

namespace oat\taoQtiItem\model\qti\asset\factory;

use Laminas\ServiceManager\ServiceLocatorAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\user\UserLanguageService;
use oat\tao\model\GenerisServiceTrait;
use oat\taoMediaManager\model\MediaService;
use oat\taoMediaManager\model\sharedStimulus\service\StoreService;
use oat\taoQtiItem\model\Export\AbstractQTIItemExporter;

class SharedStimulusFactory extends ConfigurableService
{
    use ServiceLocatorAwareTrait;
    use GenerisServiceTrait;

    private const ASSET_ROOT_CLASS_URI = 'http://www.tao.lu/Ontologies/TAOMedia.rdf#Media';

    public function createShardedStimulusFromSourceFiles(
        string $newXmlFile,
        string $relativePath,
        string $absolutePath,
        string $label
    ) {
        $assetWithCss = $this->getStoreService()->store(
            $newXmlFile,
            basename($relativePath),
            [
                $this->getRelatedCssFilePath($absolutePath)
            ]
        );

        return $this->getMediaService()->createSharedStimulusInstance(
            $assetWithCss . DIRECTORY_SEPARATOR . basename($relativePath),
            $this->getParentClassUri($label),
            $this->getUserLanguageService()->getAuthoringLanguage()
        );
    }

    private function getRelatedCssFilePath(string $absolutePath)
    {
        return dirname($absolutePath)
            . DIRECTORY_SEPARATOR
            . AbstractQTIItemExporter::CSS_DIRECTORY_NAME
            . DIRECTORY_SEPARATOR
            . AbstractQTIItemExporter::CSS_FILE_NAME;
    }

    private function getParentClassUri(string $label): string
    {
        $parentClass = $this->createSubClass(
            $this->getClass(self::ASSET_ROOT_CLASS_URI),
            $label
        );

        return $parentClass->getUri();
    }

    private function getStoreService(): StoreService
    {
        return $this->getServiceLocator()->get(StoreService::class);
    }

    private function getMediaService(): MediaService
    {
        return $this->getServiceLocator()->get(MediaService::class);
    }

    private function getUserLanguageService(): UserLanguageService
    {
        return $this->getServiceLocator()->get(UserLanguageService::SERVICE_ID);
    }
}