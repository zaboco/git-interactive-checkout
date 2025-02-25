import { PartialGitClient } from '../src/gic';
import type { BranchSummary, Response } from 'simple-git';

export interface GitClientMock extends PartialGitClient {
  mock: {
    getCurrent(): string;
  };
}

export function makeGitClientMock(branches: string[], initialCurrent: string): GitClientMock {
  let current = initialCurrent;

  return {
    branch(): Response<BranchSummary> {
      return Promise.resolve({
        all: branches,
        current,
        branches: {},
        detached: false,
      }) as Response<BranchSummary>;
    },

    checkout(newBranch): Response<string> {
      if (typeof newBranch !== 'string') {
        return Promise.reject(new Error('Unsupported')) as Response<string>;
      }

      current = newBranch;
      return Promise.resolve(newBranch) as Response<string>;
    },

    mock: {
      getCurrent(): string {
        return current;
      },
    },
  };
}
