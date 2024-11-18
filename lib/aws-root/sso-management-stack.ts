import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AWS_ACCOUNTS, ROOT_IDENTITY_STORE, SSO_INSTANCE } from '../app-config';
import { PrincipalType } from './types';

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
    const systemAdminPs = new cdk.aws_sso.CfnPermissionSet(this, 'SystemAdminPs', {
      name: 'SystemAdmin',
      instanceArn: SSO_INSTANCE.ssoInstanceArn,
      sessionDuration: 'PT12H',
      managedPolicies: [
        'arn:aws:iam::aws:policy/job-function/SystemAdministrator'
      ]
    });
    const readOnlyPs = new cdk.aws_sso.CfnPermissionSet(this, 'ReadOnlyPs', {
      name: 'ReadOnly',
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
    this.AssignPermission(systemAdminPs, developers, AWS_ACCOUNTS.tooling);
    this.AssignPermission(systemAdminPs, developers, AWS_ACCOUNTS.develop);
    this.AssignPermission(systemAdminPs, developers, AWS_ACCOUNTS.prod);
    //#endregion

    //#region ASSIGN TESTER PERMISSION
    this.AssignPermission(readOnlyPs, testers, AWS_ACCOUNTS.tooling);
    this.AssignPermission(readOnlyPs, testers, AWS_ACCOUNTS.develop);
    this.AssignPermission(readOnlyPs, testers, AWS_ACCOUNTS.prod);
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