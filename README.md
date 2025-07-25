# AWS ACCESS CONTROL - IAM Identity Center

This project automates the setup of AWS IAM Identity Center (formerly AWS SSO) using AWS CDK. It creates a centralized access management system for multiple AWS accounts with role-based permissions.

## What this project sets up

- **User Groups**: Creates Administrators, Developers, and Testers groups
- **Permission Sets**: Configures Administrator, SystemAdmin, and ReadOnly permission sets with appropriate AWS managed policies
- **Account Assignments**: Automatically assigns groups to permission sets across multiple AWS accounts (root, tooling, develop, product)
- **Session Management**: Sets 12-hour session duration for all permission sets

The `cdk.json` file tells the CDK Toolkit how to execute the app.

## Useful commands
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npm run cdk:synth`   emits the synthesized CloudFormation template
* `npm run cdk:diff`    compare deployed stack with current state
* `npm run cdk:deploy`  deploy this stack to your default AWS account/region
