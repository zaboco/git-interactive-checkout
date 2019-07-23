import test from 'ava';
import { checkoutBranch } from '../src/gic';
import { makeGitClientMock } from '../__mocks__/gitClientMock';
import { highlight, underlined } from '../src/formatters';
import { makePromptsMock } from '../__mocks__/promptsMock';

testCheckout(
  'the current branch is underlined, for no input',
  { branches: ['master'], current: 'master', input: '' },
  { matches: [underlined('master')], chosen: 'master' },
);

testCheckout(
  'the matching letters are highlighted',
  { branches: ['master'], current: 'master', input: 'ms' },
  { matches: [underlined(`${highlight('m')}a${highlight('s')}ter`)], chosen: 'master' },
);

testCheckout(
  'hoist the current branch',
  { branches: ['other', 'master'], current: 'master', input: '' },
  { matches: [underlined('master'), 'other'], chosen: 'master' },
);

testCheckout(
  'show remote branches without "remote" prefix',
  { branches: ['master', 'remotes/origin/other-remote'], current: 'master', input: '' },
  { matches: [underlined('master'), 'origin/other-remote'], chosen: 'master' },
);

testCheckout(
  'check out the local name of the remote branch',
  { branches: ['master', 'remotes/origin/other-remote'], current: 'master', input: 'other' },
  {
    matches: [`origin/${highlight('other')}-remote`],
    chosen: 'other-remote',
  },
);

function testCheckout(
  title: string,
  given: { branches: string[]; current: string; input: string },
  expected: { matches: string[]; chosen: string },
) {
  test(title, async t => {
    const gitClientMock = makeGitClientMock(given.branches, given.current);
    const promptsMock = makePromptsMock(given.input);

    await checkoutBranch(gitClientMock, promptsMock.promptsFunction);

    t.deepEqual(
      promptsMock.getMatchingBranchChoices().map(branchChoice => branchChoice.title),
      expected.matches,
    );
    t.is(gitClientMock.mock.getCurrent(), expected.chosen);
  });
}
