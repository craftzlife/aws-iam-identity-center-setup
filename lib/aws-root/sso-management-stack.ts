import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ROOT_IDENTITY_STORE } from './config';
import { PrincipalType } from './types';

//#region AWS ACCOUNTS
const AWS_ACCOUNTS = {
  'aws-root': '462599156704',
  'develop': '941377147791',
  'prod': '825765401882',
  'tooling': '475174330998',
};
//#endregion

export const SSO_INSTANCE = {
  account: '462599156704',
  region: 'ap-southeast-1',
  ssoInstanceArn: 'arn:aws:sso:::instance/ssoins-8210ca2c9e29612f',
};

export class SSOManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // The code that defines your stack goes here

    //#region GROUPS
    const admins = new cdk.aws_identitystore.CfnGroup(this, 'Administrators', {
      displayName: 'Administrators',
      identityStoreId: ROOT_IDENTITY_STORE,
      description: 'Administrators',
    });
    const developers = new cdk.aws_identitystore.CfnGroup(this, 'Developers', {
      displayName: 'Developers',
      description: 'Developers',
      identityStoreId: ROOT_IDENTITY_STORE,
    });
    const testers = new cdk.aws_identitystore.CfnGroup(this, 'Testers', {
      displayName: 'Testers',
      description: 'Testers',
      identityStoreId: ROOT_IDENTITY_STORE,
    });
    //#endregion

    //#region PERMISSION SETS
    const administratorPs = new cdk.aws_sso.CfnPermissionSet(this, 'AdministratorPs', {
      name: 'Administrator',
      instanceArn: SSO_INSTANCE.ssoInstanceArn,
      sessionDuration: 'PT12H',
      managedPolicies: [
        'arn:aws:iam::aws:policy/AdministratorAccess'
      ]
    });
    const developerPs = new cdk.aws_sso.CfnPermissionSet(this, 'DeveloperPs', {
      name: 'Developer',
      instanceArn: SSO_INSTANCE.ssoInstanceArn,
      sessionDuration: 'PT12H',
      managedPolicies: [
        'arn:aws:iam::aws:policy/job-function/SystemAdministrator'
      ]
    });
    const testerPs = new cdk.aws_sso.CfnPermissionSet(this, 'TesterPs', {
      name: 'Tester',
      instanceArn: SSO_INSTANCE.ssoInstanceArn,
      sessionDuration: 'PT12H',
      managedPolicies: [
        'arn:aws:iam::aws:policy/ReadOnlyAccess'
      ]
    });
    //#endregion

    //#region ASSIGN ADMIN PERMISSIONS
    this.AssignPermission(administratorPs, admins, AWS_ACCOUNTS['aws-root']);
    this.AssignPermission(administratorPs, admins, AWS_ACCOUNTS.tooling);
    this.AssignPermission(administratorPs, admins, AWS_ACCOUNTS.develop);
    this.AssignPermission(administratorPs, admins, AWS_ACCOUNTS.prod);
    //#endregion

    //#region ASSIGN DEVELOPER PERMISSION
    this.AssignPermission(developerPs, developers, AWS_ACCOUNTS.tooling);
    this.AssignPermission(developerPs, developers, AWS_ACCOUNTS.develop);
    this.AssignPermission(developerPs, developers, AWS_ACCOUNTS.prod);
    //#endregion

    //#region ASSIGN TESTER PERMISSION
    this.AssignPermission(testerPs, testers, AWS_ACCOUNTS.develop);
    this.AssignPermission(testerPs, testers, AWS_ACCOUNTS.prod);
    //#endregion
  }

  AssignPermission(administratorPs: cdk.aws_sso.CfnPermissionSet, group: cdk.aws_identitystore.CfnGroup, awsAccountId: string) {
    const constructId = [administratorPs, group.displayName.replace(' ', ''), awsAccountId].join('-');
    return new cdk.aws_sso.CfnAssignment(this, constructId, {
      instanceArn: SSO_INSTANCE.ssoInstanceArn,
      permissionSetArn: administratorPs.attrPermissionSetArn,
      principalId: group.attrGroupId,
      principalType: PrincipalType.GROUP,
      targetId: awsAccountId,
      targetType: 'AWS_ACCOUNT',
    });
  }
}