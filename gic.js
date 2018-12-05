#!/usr/bin/env node

const git = require('simple-git/promise');
const prompts = require('prompts');
const fuzzysort = require('fuzzysort');

const workingDir = process.cwd();
const localGit = git(workingDir);

async function checkoutBranch() {
  const { all: rawBranches, current } = await localGit.branch();
  const branches = removeOriginDuplicates(stripRemotesPrefix(hoistCurrentBranch(rawBranches, current)));
  const { value: newBranch } = await getPrompt(branches);
  const normalizedBranch = newBranch.replace(/^origin\//, '')
  localGit.checkout(normalizedBranch);
}

async function getPrompt(branches) {
  return await prompts({
    type: 'autocomplete',
    name: 'value',
    message: 'Choose branch',
    choices: branches.map(
      (branch, index) =>
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

function hoistCurrentBranch(branches, current) {
  return [current, ...branches.filter(branch => branch !== current)];
}

function removeOriginDuplicates(branches) {
  const allOriginBranches = branches.filter(branch => branch.startsWith('origin/'))
  const localBranches = branches.filter(branch => !branch.startsWith('origin/'))
  const originOnlyBranches = allOriginBranches.filter(branch => !localBranches.includes(getLocalName(branch)))
  return [...localBranches, ...originOnlyBranches]
}

function getLocalName(branch) {
  return branch.replace(/^origin\//, '');
}

function stripRemotesPrefix(branches) {
  return branches.map(branch => branch.replace('remotes/', ''));
}

checkoutBranch();
