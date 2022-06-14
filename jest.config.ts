import { getJestProjects } from '@nrwl/jest';

export default {
  projects: getJestProjects(),
  testTimeout: 10000
};
