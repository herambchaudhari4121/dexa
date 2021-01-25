import { copyFile, rm } from 'fs/promises';
import { URL } from 'url';

const ROOT_DIR = new URL('../', import.meta.url);

const ASSETS_PACKAGE_JSON = new URL('assets/package.lambda.json', ROOT_DIR);
const AWS_DIR = new URL('dist/', ROOT_DIR);
const AWS_PACKAGE_JSON = new URL('package.json', AWS_DIR);
const AWS_TSBUILDINFO = new URL('tsconfig.tsbuildinfo', AWS_DIR);

void Promise.all([copyFile(ASSETS_PACKAGE_JSON, AWS_PACKAGE_JSON), rm(AWS_TSBUILDINFO)]);
