<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:07
 */

namespace oat\taoQtiItem\model\portableElement\base\helper;


use League\Flysystem\AdapterInterface;

trait FileSystemAwareTrait
{

    /**
     * @var AdapterInterface
     */
    protected $fileSystem;

    /**
     * set up file system abstraction
     *
     * @param AdapterInterface $fileSystem
     * @return $this
     */
    public function setFileSystem(AdapterInterface $fileSystem) {

        $this->fileSystem = $fileSystem;
        return $this;

    }

}