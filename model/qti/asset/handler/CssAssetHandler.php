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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\model\qti\asset\handler;

use Laminas\ServiceManager\ServiceLocatorAwareTrait;
use core_kernel_classes_Resource;
use oat\generis\model\kernel\persistence\smoothsql\search\ComplexSearchService;
use oat\generis\model\OntologyAwareTrait;
use oat\generis\model\OntologyRdfs;
use oat\search\helper\SupportedOperatorHelper;
use oat\tao\helpers\FileUploadException;
use oat\tao\model\media\MediaManagement;
use oat\tao\model\media\MediaService;
use oat\taoMediaManager\model\MediaSource;
use oat\taoMediaManager\model\TaoMediaOntology;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\XInclude;
use tao_helpers_Uri;

class CssAssetHandler implements AssetHandler
{
    use OntologyAwareTrait;
    use ServiceLocatorAwareTrait;

    private const MIME_TYPE = 'text/css';

    /** @var MediaManagement */
    private $mediaSource;

    /** @var Item */
    private $qtiModel;

    private array $targetClassPath;

    public function __construct()
    {
        $sources = MediaService::singleton()->getWritableSources();
        $this->mediaSource = array_shift($sources);
    }

    public function isApplicable($relativePath)
    {
        if (
            !$this->mediaSource
            || !$this->isItemStylesheet($relativePath)
            || !$this->isCss($relativePath)
        ) {
            return false;
        }

        return !$this->isPassageStylesheet($relativePath);
    }

    public function handle($absolutePath, $relativePath)
    {
        $fileName = basename($relativePath);
        $content = file_get_contents($absolutePath);

        if ($content === false) {
            throw new FileUploadException('Unable to read CSS asset "' . $absolutePath . '".');
        }

        $contentHash = hash('sha256', $content);

        $candidates = $this->findCandidates($fileName);
        $matchingCandidate = $this->findMatchingCandidate($candidates, $contentHash);

        if ($matchingCandidate !== null) {
            return ['uri' => $this->buildUri($matchingCandidate)];
        }

        $fileInfo = $this->mediaSource->add(
            $absolutePath,
            $fileName,
            json_encode($this->getTargetClassPath())
        );

        $this->ensureCssMimeType((string) $fileInfo['uri']);

        return ['uri' => $fileInfo['uri']];
    }

    /**
     * The media source derives the MIME type from the file, which is not guaranteed to be text/css.
     */
    private function ensureCssMimeType(string $uri): void
    {
        if (strpos($uri, MediaSource::SCHEME_NAME) === 0) {
            $uri = tao_helpers_Uri::decode(substr($uri, strlen(MediaSource::SCHEME_NAME)));
        }

        $resource = new core_kernel_classes_Resource($uri);

        if (!$resource->exists()) {
            return;
        }

        $property = $this->getProperty(TaoMediaOntology::PROPERTY_MIME_TYPE);
        $mime = strtolower(trim(explode(';', (string) $resource->getOnePropertyValue($property))[0]));

        if ($mime !== self::MIME_TYPE) {
            $resource->editPropertyValues($property, self::MIME_TYPE);
        }
    }

    public function finalize()
    {
    }

    public function setQtiModel(Item $qtiModel): self
    {
        $this->qtiModel = $qtiModel;

        return $this;
    }

    public function setTargetClassPath(array $targetClassPath): self
    {
        $this->targetClassPath = $targetClassPath;

        return $this;
    }

    public function getTargetClassPath(): array
    {
        return $this->targetClassPath;
    }

    private function getQtiModel(): Item
    {
        if ($this->qtiModel === null) {
            throw new FileUploadException('Unable to found a valid Qti File.');
        }

        return $this->qtiModel;
    }

    private function isItemStylesheet(string $relativePath): bool
    {
        foreach ($this->getQtiModel()->getStylesheets() as $stylesheet) {
            if ((string) $stylesheet->attr('href') === $relativePath) {
                return true;
            }
        }

        return false;
    }

    private function isCss(string $relativePath): bool
    {
        return strtolower(pathinfo($relativePath, PATHINFO_EXTENSION)) === 'css';
    }

    private function isPassageStylesheet(string $relativePath): bool
    {
        $relativePath = str_replace('\\', '/', $relativePath);

        foreach ($this->getQtiModel()->getComposingElements(XInclude::class) as $xincludeElement) {
            $href = str_replace('\\', '/', (string) $xincludeElement->attr('href'));

            if ($href === '') {
                continue;
            }

            $directory = dirname($href);
            $prefix = ($directory === '.' || $directory === '')
                ? 'css/'
                : $directory . '/css/';

            if (strpos($relativePath, $prefix) === 0) {
                return true;
            }
        }

        return false;
    }

    private function findCandidates(string $fileName): array
    {
        $complexSearch = $this->getServiceLocator()->get(ComplexSearchService::SERVICE_ID);
        $queryBuilder = $complexSearch->query();
        $criteria = $complexSearch->searchType(
            $queryBuilder,
            TaoMediaOntology::CLASS_URI_MEDIA_ROOT,
            true
        );
        $criteria->addCriterion(OntologyRdfs::RDFS_LABEL, SupportedOperatorHelper::EQUAL, $fileName);
        $criteria->addCriterion(
            TaoMediaOntology::PROPERTY_MIME_TYPE,
            SupportedOperatorHelper::EQUAL,
            self::MIME_TYPE
        );
        $queryBuilder->setCriteria($criteria);

        $result = $complexSearch->getGateway()->search($queryBuilder);

        if ($result instanceof \Traversable) {
            return iterator_to_array($result, false);
        }

        return (array) $result;
    }

    private function findMatchingCandidate(array $candidates, string $contentHash): ?object
    {
        foreach ($candidates as $candidate) {
            try {
                $fileInfo = $this->mediaSource->getFileInfo($candidate->getUri());

                if (!isset($fileInfo['link'])) {
                    continue;
                }

                $stream = $this->mediaSource->getFileStream($candidate->getUri());

                if (hash('sha256', $stream->getContents()) === $contentHash) {
                    return $candidate;
                }
            } catch (\Throwable $exception) {
                continue;
            }
        }

        return null;
    }

    private function buildUri(object $candidate): string
    {
        return MediaSource::SCHEME_NAME . tao_helpers_Uri::encode($candidate->getUri());
    }
}
