#!/usr/bin/env node

import * as fuzzysort from 'fuzzysort';
import git from 'simple-git';
import { SimpleGit } from 'simple-git';
import * as prompts from 'prompts';
import { highlightMatchResult, underlined } from './formatters';

export type PartialGitClient = Pick<SimpleGit, 'branch' | 'checkout'>;

export type AutocompletePromptObject = {
  type: 'autocomplete';
  name: string;
  message: string;
  choices: prompts.Choice[];
  suggest: (input: string, choices: prompts.Choice[]) => Promise<prompts.Choice[]>;
};

export async function checkoutBranch(
  gitClient: PartialGitClient,
  promptsFunction: (promptObject: AutocompletePromptObject) => Promise<prompts.Answers<'value'>>,
) {
  const { all: rawBranches, current } = await gitClient.branch(['-a', '-v']);
  const branches = normalizeBranches(rawBranches, current);
  try {
    const { value: newBranch } = await promptsFunction(buildBranchesPrompt(branches, current));
    gitClient.checkout(getLocalName(newBranch));
  } catch (_e) {}
}

function buildBranchesPrompt(branches: string[], current: string): AutocompletePromptObject {
  return {
    type: 'autocomplete',
    name: 'value',
    message: 'Choose branch',
    choices: branches.map(branch => ({ title: branch, value: branch })),
    suggest: async (input, choices) => {
      const matches = input
        ? fuzzysort.go(input, choices, { key: 'title' }).map(result => {
            return {
              title: highlightMatchResult(result),
              value: result.obj.value,
            };
          })
        : choices;
      return matches.map(match => {
        return match.value === current
          ? {
              title: underlined(match.title),
              value: match.value,
            }
          : match;
      });
    },
  };
}

function normalizeBranches(rawBranches: string[], current: string) {
  return removeOriginDuplicates(stripRemotesPrefix(hoistCurrentBranch(rawBranches, current)));
}

function hoistCurrentBranch(branches: string[], current: string) {
  return [current, ...branches.filter(branch => branch !== current)];
}

function stripRemotesPrefix(branches: string[]) {
  return branches.map(branch => branch.replace('remotes/', ''));
}

function removeOriginDuplicates(branches: string[]) {
  const allOriginBranches = branches.filter(branch => branch.startsWith('origin/'));
  const localBranches = branches.filter(branch => !branch.startsWith('origin/'));
  const originOnlyBranches = allOriginBranches.filter(
    branch => !localBranches.includes(getLocalName(branch)),
  );
  return [...localBranches, ...originOnlyBranches];
}

function getLocalName(branch: string) {
  return branch.replace(/^origin\//, '');
}

/* istanbul ignore if */
if (require.main === module) {
  const localGit = git(process.cwd());
  checkoutBranch(localGit, prompts);
}
