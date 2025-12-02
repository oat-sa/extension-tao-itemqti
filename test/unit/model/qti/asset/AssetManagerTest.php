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
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\asset;

use helpers_File;
use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\asset\AssetManager;

class AssetManagerTest extends TestCase
{
    public function testIsFileInsideDirectoryAllowsChild(): void
    {
        $result = helpers_File::isPathInsideDirectory('css/style.css', '/var/data/item');

        $this->assertTrue($result);
    }

    public function testIsFileInsideDirectoryDeniesTraversal(): void
    {
        $result = helpers_File::isPathInsideDirectory('../etc/passwd', '/var/data/item');

        $this->assertFalse($result);
    }

    public function testIsFileInsideDirectoryAbsoluteInside(): void
    {
        $result = helpers_File::isPathInsideDirectory('/var/data/item/css/style.css', '/var/data/item');

        $this->assertTrue($result);
    }

    public function testIsFileInsideDirectoryAbsoluteOutside(): void
    {
        $result = helpers_File::isPathInsideDirectory('/var/data/other/file.css', '/var/data/item');

        $this->assertFalse($result);
    }

    public function testCopyFileLocalToLocal(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'am_src_');
        $destinationDir = sys_get_temp_dir() . '/am_dest_' . uniqid();
        $destination = $destinationDir . '/file.txt';
        file_put_contents($source, 'content');

        $result = helpers_File::copySafe($source, $destination);

        $this->assertTrue($result);
        $this->assertFileExists($destination);
        $this->assertSame('content', file_get_contents($destination));

        @unlink($source);
        @unlink($destination);
        @rmdir($destinationDir);
    }

    public function testCopyFileStreamWrapper(): void
    {
        $plainSource = tempnam(sys_get_temp_dir(), 'am_src_plain_');
        file_put_contents($plainSource, 'stream-content');

        $compressedSource = tempnam(sys_get_temp_dir(), 'am_src_gz_') . '.gz';
        file_put_contents($compressedSource, gzencode('stream-content'));

        $compressedDest = tempnam(sys_get_temp_dir(), 'am_dest_gz_') . '.gz';

        $srcPath = 'compress.zlib://' . $compressedSource;
        $destPath = 'compress.zlib://' . $compressedDest;

        $result = helpers_File::copySafe($srcPath, $destPath);

        $this->assertTrue($result);
        $this->assertFileExists($compressedDest);
        $this->assertSame('stream-content', gzdecode(file_get_contents($compressedDest)));

        @unlink($plainSource);
        @unlink($compressedSource);
        @unlink($compressedDest);
    }

    private function invokePrivate(object $object, string $method, ...$args)
    {
        $reflection = new \ReflectionMethod($object, $method);
        $reflection->setAccessible(true);

        return $reflection->invokeArgs($object, $args);
    }
}
