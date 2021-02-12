<?php

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\parser;

use \tao_helpers_File;

final class TempFolder
{
    /**
     * @var string
     */
    private $dirname;

    public function __construct()
    {
        $this->dirname = $this->createTempDir();
    }

    public function delete(): void
    {
        if (isset($this->dirname)) {
            tao_helpers_File::delTree($this->dirname);
        }
    }

    public function getDirname(): string
    {
        return $this->dirname;
    }

    private function createTempDir(): string
    {
        $dirname = tao_helpers_File::createTempDir();
        if (!is_dir($dirname)) {
            mkdir($dirname);
        }

        return $dirname;
    }
}