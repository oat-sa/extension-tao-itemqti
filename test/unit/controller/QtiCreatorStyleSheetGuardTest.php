<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\controller;

use core_kernel_classes_Resource;
use oat\generis\test\ServiceManagerMockTrait;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\media\MediaBrowser;
use oat\tao\model\media\MediaService;
use oat\taoQtiItem\controller\QtiCreator;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Stylesheet;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use ReflectionClass;
use ReflectionMethod;
use RuntimeException;

class QtiCreatorStyleSheetGuardTest extends TestCase
{
    use ServiceManagerMockTrait;

    /**
     * @dataProvider nonLibraryStylesheetProvider
     */
    public function testNonLibraryStyleSheetsAreNotChecked(string $href): void
    {
        $this->invokeGuard($this->createController(), $href);

        $this->addToAssertionCount(1);
    }

    public function nonLibraryStylesheetProvider(): array
    {
        return [
            'relative path' => ['styles/item.css'],
            'http url' => ['http://example.test/styles/item.css'],
            'https url' => ['https://example.test/styles/item.css'],
            'other scheme' => ['data:text/css;base64,Ym9keXt9'],
        ];
    }

    public function testNonCssMediaAssetIsRejected(): void
    {
        $this->registerMediaSource('image/png', 'photo.png');

        $this->expectExceptionMessage('photo.png');

        $this->invokeGuard($this->createController(), 'taomedia://mediamanager/photo.png');
    }

    public function testCssMediaAssetIsAccepted(): void
    {
        $this->registerMediaSource('text/css; charset=UTF-8', 'theme.css');

        $this->invokeGuard($this->createController(), 'taomedia://mediamanager/theme.css');

        $this->addToAssertionCount(1);
    }

    public function testUnresolvableMediaAssetIsIgnored(): void
    {
        $mediaService = $this->createMock(MediaService::class);
        $mediaService->method('getMediaSource')->willThrowException(new RuntimeException('unavailable'));
        ServiceManager::setServiceManager(
            $this->getServiceManagerMock([MediaService::SERVICE_ID => $mediaService])
        );

        $this->invokeGuard($this->createController(), 'taomedia://mediamanager/missing.css');

        $this->addToAssertionCount(1);
    }

    private function createController(): QtiCreator
    {
        $controller = (new ReflectionClass(QtiCreator::class))->newInstanceWithoutConstructor();
        $controller->setLogger(new NullLogger());

        return $controller;
    }

    private function invokeGuard(QtiCreator $controller, string $href): void
    {
        $stylesheet = $this->createMock(Stylesheet::class);
        $stylesheet->method('getAttributeValue')->with('href')->willReturn($href);

        $item = $this->createMock(Item::class);
        $item->method('getAttributeValue')->with('xml:lang')->willReturn('en-US');
        $item->method('getStylesheets')->willReturn([$stylesheet]);

        $method = new ReflectionMethod(QtiCreator::class, 'assertStyleSheetsAreCss');
        $method->setAccessible(true);

        $method->invoke(
            $controller,
            $item,
            $this->createMock(core_kernel_classes_Resource::class)
        );
    }

    private function registerMediaSource(string $mime, string $name): void
    {
        $mediaSource = $this->createMock(MediaBrowser::class);
        $mediaSource->method('getFileInfo')->willReturn(['mime' => $mime, 'name' => $name]);

        $mediaService = $this->createMock(MediaService::class);
        $mediaService->method('getMediaSource')->with('mediamanager')->willReturn($mediaSource);

        ServiceManager::setServiceManager(
            $this->getServiceManagerMock([MediaService::SERVICE_ID => $mediaService])
        );
    }
}
