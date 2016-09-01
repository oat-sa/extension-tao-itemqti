<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:06
 */

namespace oat\taoQtiItem\model\portableElement\base\helper;


use League\Flysystem\AdapterInterface;

interface FileSystemAwareInterface
{
    /**
     * set up file system abstraction
     *
     * @param AdapterInterface $fileSystem
     * @return $this
     */
    public function setFileSystem(AdapterInterface $fileSystem);

}