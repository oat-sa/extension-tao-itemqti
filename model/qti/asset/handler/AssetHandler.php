<?php

namespace oat\taoQtiItem\model\qti\asset\handler;

abstract class AssetHandler
{
    protected $attributes;

    public abstract function __construct($itemSource);

    public function isApplicable($relativePath)
    {
        return true;
    }

    public abstract function handle($absolutePath, $relativePath);

    public function set($key, $value)
    {
        $this->attributes[$key] = $value;
        return $this;
    }

    public function get($key)
    {
        if (!isset($this->attributes[$key])) {
            return false;
        }
        return $this->attributes[$key];
    }

    public function setParameters(array $parameters)
    {
        foreach ($parameters as $key => $parameter) {
            $this->set($key, $parameter);
        }
    }

    public function getParameters()
    {
        return $this->attributes;
    }
}