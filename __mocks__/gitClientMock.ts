import { PartialGitClient } from '../src/gic';
import { BranchSummary } from 'simple-git/typings/response';

export interface GitClientMock extends PartialGitClient {
  mock: {
    getCurrent(): string;
  };
}

export function makeGitClientMock(branches: string[], initialCurrent: string): GitClientMock {
  let current = initialCurrent;

  return {
    async branch(): Promise<BranchSummary> {
      return {
        all: branches,
        current,
        branches: {},
        detached: false,
      };
    },

    async checkout(newBranch: string) {
      current = newBranch;
    },

    mock: {
      getCurrent(): string {
        return current;
      },
    },
  };
}
