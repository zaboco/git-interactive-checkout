import * as prompts from 'prompts';
import { AutocompletePromptObject } from '../src/gic';

export function makePromptsMock(input: string) {
  let matchingBranchChoices: prompts.Choice[];

  return {
    async promptsFunction(
      promptObject: AutocompletePromptObject,
    ): Promise<prompts.Answers<'value'>> {
      matchingBranchChoices = await promptObject.suggest(input, promptObject.choices);
      return { value: matchingBranchChoices[0].value };
    },

    getMatchingBranchChoices: () => matchingBranchChoices,
  };
}
