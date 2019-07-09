#!/usr/bin/env node

import * as fuzzysort from 'fuzzysort';
import * as git from 'simple-git/promise';
import * as prompts from 'prompts';

const workingDir = process.cwd();
const localGit = git(workingDir);

async function checkoutBranch() {
  const { all: rawBranches, current } = await localGit.branch(['-a', '-v']);
  const branches = removeOriginDuplicates(
    stripRemotesPrefix(hoistCurrentBranch(rawBranches, current)),
  );
  try {
    const { value: newBranch } = await getPrompt(branches);
    localGit.checkout(getLocalName(newBranch));
  } catch (_e) {}
}

async function getPrompt(branches: string[]) {
  return await prompts({
    type: 'autocomplete',
    name: 'value',
    message: 'Choose branch',
    choices: branches.map((branch, index) =>
      index === 0
        ? { title: `\x1b[4m${branch}\x1b[24m`, value: branch }
        : { title: branch, value: branch },
    ),
    suggest: async (input, choices) => {
      const matches = input
        ? fuzzysort.go(input, choices, { key: 'title' }).map(result => ({
            title: fuzzysort.highlight(result, '\x1b[42m', '\x1b[49m'),
            value: result.obj.value,
          }))
        : choices;
      return matches;
    },
  });
}

function hoistCurrentBranch(branches: string[], current: string) {
  return [current, ...branches.filter(branch => branch !== current)];
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

function stripRemotesPrefix(branches: string[]) {
  return branches.map(branch => branch.replace('remotes/', ''));
}

checkoutBranch();
