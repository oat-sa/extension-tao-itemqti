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

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\asset\handler;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\generis\model\data\RdfsInterface;
use oat\generis\model\kernel\persistence\smoothsql\search\ComplexSearchService;
use oat\generis\test\ServiceManagerMockTrait;
use oat\oatbox\service\ServiceManager;
use oat\search\base\QueryBuilderInterface;
use oat\search\base\QueryInterface;
use oat\search\base\SearchGateWayInterface;
use oat\tao\model\media\MediaManagement;
use oat\taoMediaManager\model\MediaSource;
use oat\taoMediaManager\model\TaoMediaOntology;
use oat\taoQtiItem\model\qti\asset\handler\CssAssetHandler;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Stylesheet;
use oat\taoQtiItem\model\qti\XInclude;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\StreamInterface;
use ReflectionClass;
use ReflectionProperty;
use tao_helpers_Uri;

class CssAssetHandlerTest extends TestCase
{
    use ServiceManagerMockTrait;

    /** @var CssAssetHandler */
    private $handler;

    /** @var MediaManagement|MockObject */
    private $mediaSource;

    /** @var ComplexSearchService|MockObject */
    private $search;

    /** @var ServiceManager */
    private $originalServiceManager;

    /** @var string[] */
    private $temporaryFiles = [];

    protected function setUp(): void
    {
        parent::setUp();

        if (!interface_exists(TaoMediaOntology::class)) {
            $this->markTestSkipped('The media manager extension is not installed.');
        }

        $this->originalServiceManager = ServiceManager::getServiceManager();
        $this->mediaSource = $this->createMock(MediaManagement::class);
        $this->search = $this->createMock(ComplexSearchService::class);

        $this->handler = (new ReflectionClass(CssAssetHandler::class))->newInstanceWithoutConstructor();

        $mediaSourceProperty = new ReflectionProperty(CssAssetHandler::class, 'mediaSource');
        $mediaSourceProperty->setAccessible(true);
        $mediaSourceProperty->setValue($this->handler, $this->mediaSource);

        $this->configureServiceLocator();
    }

    protected function tearDown(): void
    {
        foreach ($this->temporaryFiles as $temporaryFile) {
            if (is_file($temporaryFile)) {
                unlink($temporaryFile);
            }
        }

        ServiceManager::setServiceManager($this->originalServiceManager);

        parent::tearDown();
    }

    public function testHandleReusesCandidateWithMatchingContentHash(): void
    {
        $content = '.item { color: red; }';
        $absolutePath = $this->createCssFile($content);
        $candidateUri = 'http://example.test/tao.rdf#asset-1';

        $this->givenCandidates([$this->createCandidate($candidateUri)]);

        $stream = $this->createMock(StreamInterface::class);
        $stream->method('getContents')->willReturn($content);

        $this->mediaSource
            ->expects($this->once())
            ->method('getFileInfo')
            ->with($candidateUri)
            ->willReturn(['link' => 'asset-1']);
        $this->mediaSource
            ->expects($this->once())
            ->method('getFileStream')
            ->with($candidateUri)
            ->willReturn($stream);
        $this->mediaSource
            ->expects($this->never())
            ->method('add');

        $result = $this->handler->handle($absolutePath, 'styles/theme.css');

        $this->assertSame(
            MediaSource::SCHEME_NAME . tao_helpers_Uri::encode($candidateUri),
            $result['uri']
        );
    }

    public function testHandleAddsNewAssetWhenNoCandidateExists(): void
    {
        $absolutePath = $this->createCssFile('.item { color: blue; }');
        $targetClassPath = ['class' => 'http://example.test/tao.rdf#class'];

        $this->givenCandidates([]);
        $this->handler->setTargetClassPath($targetClassPath);

        $this->mediaSource
            ->expects($this->once())
            ->method('add')
            ->with($absolutePath, 'theme.css', json_encode($targetClassPath))
            ->willReturn(['uri' => 'http://example.test/tao.rdf#new-asset']);

        $result = $this->handler->handle($absolutePath, 'styles/theme.css');

        $this->assertSame('http://example.test/tao.rdf#new-asset', $result['uri']);
    }

    public function testHandleAddsNewAssetWhenCandidateContentDiffers(): void
    {
        $absolutePath = $this->createCssFile('.item { color: blue; }');
        $candidateUri = 'http://example.test/tao.rdf#asset-1';
        $targetClassPath = ['class' => 'http://example.test/tao.rdf#class'];

        $this->givenCandidates([$this->createCandidate($candidateUri)]);
        $this->handler->setTargetClassPath($targetClassPath);

        $stream = $this->createMock(StreamInterface::class);
        $stream->method('getContents')->willReturn('.item { color: red; }');

        $this->mediaSource
            ->expects($this->once())
            ->method('getFileInfo')
            ->with($candidateUri)
            ->willReturn(['link' => 'asset-1']);
        $this->mediaSource
            ->expects($this->once())
            ->method('getFileStream')
            ->with($candidateUri)
            ->willReturn($stream);
        $this->mediaSource
            ->expects($this->once())
            ->method('add')
            ->with($absolutePath, 'theme.css', json_encode($targetClassPath))
            ->willReturn(['uri' => 'http://example.test/tao.rdf#new-asset']);

        $result = $this->handler->handle($absolutePath, 'styles/theme.css');

        $this->assertSame('http://example.test/tao.rdf#new-asset', $result['uri']);
    }

    public function testIsApplicableReturnsFalseForNonCssRelativePath(): void
    {
        $this->handler->setQtiModel($this->createQtiModel([], 'styles/theme.png'));

        $this->assertFalse($this->handler->isApplicable('styles/theme.png'));
    }

    public function testIsApplicableReturnsFalseForPassageStylesheet(): void
    {
        $relativePath = 'passages/css/theme.css';

        $this->handler->setQtiModel(
            $this->createQtiModel(
                [$this->createXInclude('passages/passage.xml')],
                $relativePath
            )
        );

        $this->assertFalse($this->handler->isApplicable($relativePath));
    }

    private function configureServiceLocator(): void
    {
        // Stub the resource as missing so ensureCssMimeType() returns before writing; the MIME update is not asserted.
        $resourceImplementation = $this->createMock(\core_kernel_persistence_ResourceInterface::class);
        $resourceImplementation->method('getTypes')->willReturn([]);

        $rdfsInterface = $this->createMock(RdfsInterface::class);
        $rdfsInterface->method('getResourceImplementation')->willReturn($resourceImplementation);

        $ontology = $this->createMock(Ontology::class);
        $ontology->method('getRdfsInterface')->willReturn($rdfsInterface);

        $serviceManager = $this->getServiceManagerMock(
            [
                Ontology::SERVICE_ID => $ontology,
                ComplexSearchService::SERVICE_ID => $this->search,
            ]
        );

        ServiceManager::setServiceManager($serviceManager);
        $this->handler->setServiceLocator($serviceManager);
    }

    private function createCandidate(string $uri): core_kernel_classes_Resource
    {
        $candidate = $this->createMock(core_kernel_classes_Resource::class);
        $candidate->method('getUri')->willReturn($uri);

        return $candidate;
    }

    private function givenCandidates(array $candidates): void
    {
        $queryBuilder = $this->createMock(QueryBuilderInterface::class);
        $criteria = $this->createMock(QueryInterface::class);
        $gateway = $this->createMock(SearchGateWayInterface::class);

        $this->search->method('query')->willReturn($queryBuilder);
        $this->search
            ->method('searchType')
            ->with($queryBuilder, TaoMediaOntology::CLASS_URI_MEDIA_ROOT, true)
            ->willReturn($criteria);
        $this->search->method('getGateway')->willReturn($gateway);
        $gateway->method('search')->with($queryBuilder)->willReturn($candidates);
    }

    private function createQtiModel(array $xIncludes, string $stylesheetHref): Item
    {
        $stylesheet = $this->createMock(Stylesheet::class);
        $stylesheet
            ->method('attr')
            ->with('href')
            ->willReturn($stylesheetHref);

        $qtiModel = $this->createMock(Item::class);
        $qtiModel->method('getStylesheets')->willReturn([$stylesheet]);
        $qtiModel
            ->method('getComposingElements')
            ->with(XInclude::class)
            ->willReturn($xIncludes);

        return $qtiModel;
    }

    private function createXInclude(string $href): XInclude
    {
        $xInclude = $this->createMock(XInclude::class);
        $xInclude
            ->method('attr')
            ->with('href')
            ->willReturn($href);

        return $xInclude;
    }

    private function createCssFile(string $content): string
    {
        $absolutePath = tempnam(sys_get_temp_dir(), 'tao-css-');

        if ($absolutePath === false) {
            $this->fail('Unable to create a temporary CSS file.');
        }

        file_put_contents($absolutePath, $content);
        $this->temporaryFiles[] = $absolutePath;

        return $absolutePath;
    }
}
