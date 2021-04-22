<?php


namespace oat\taoQtiItem\model\import\Parser;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\ParsedChoice;

class ChoiceParser extends ConfigurableService implements ColumnParserInterface
{

    public function parse(array $line, array $rules, string ...$fields)
    {
        $parsedChoices = [];
        $columnName = $fields[0];

        $choices = $this->findKeysByMask($columnName, $line);

        $choicesScores = array_map('floatval', $this->findKeysByMask($this->findDependentColumn($columnName), $line));
        foreach ($choices as $choiceId => $choice) {
            $parsedChoices[] = new ParsedChoice($choiceId, $choice, $choicesScores[$choiceId.'_score'] ?? 0.0);
        }
        return $parsedChoices;
    }

    private function findKeysByMask(string $pattern, array $input, $flags = 0): array
    {
        $pattern = '/\b('.$pattern.')\b/';
        return array_intersect_key($input, array_flip(preg_grep($pattern, array_keys($input), $flags)));
    }

    private function findDependentColumn(string $column): ?string
    {
        return 'choice_[1-99]_score';//
    }
}