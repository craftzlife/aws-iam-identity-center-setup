#!/usr/bin/env node
import 'source-map-support/register';
import { SSO_INSTANCE } from '../lib/app-config';
import { SSOManagementStack } from '../lib/sso-management-stack';
import * as cdk from 'aws-cdk-lib';
import * as Tagging from './tagging';

const app = new cdk.App();

const ssoMgtStack = new SSOManagementStack(app, 'SSOManagementStack', {
  env: {
    account: SSO_INSTANCE.account,
    region: SSO_INSTANCE.region,
  },
  stackName: 'SSOManagement',
});
