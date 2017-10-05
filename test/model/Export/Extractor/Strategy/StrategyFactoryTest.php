<?php

namespace oat\taoQtiItem\test\model\Export\Extractor\Strategy;

use oat\taoQtiItem\model\Export\Extractor\Strategy\ColumnStrategy;
use oat\taoQtiItem\model\Export\Extractor\Strategy\LineStrategy;
use oat\taoQtiItem\model\Export\Extractor\Strategy\Strategy;
use oat\taoQtiItem\model\Export\Extractor\Strategy\StrategyFactory;
use PHPUnit\Framework\TestCase;

class StrategyFactoryTest extends TestCase
{
    public function testFactoryBuildsStrategy()
    {
        $this->assertInstanceOf(Strategy::class, StrategyFactory::create([], 'column', []));
    }

    public function testFactoryBuildColumnStrategy()
    {
        $this->assertInstanceOf(ColumnStrategy::class, StrategyFactory::create(['valuesAsColumns' => false], 'column', []));
        $this->assertInstanceOf(ColumnStrategy::class, StrategyFactory::create([], 'column', []));
    }

    public function testFactoryBuildLineStrategy()
    {
        $this->assertInstanceOf(LineStrategy::class, StrategyFactory::create(['valuesAsColumns' => true], 'column', []));
    }
}
