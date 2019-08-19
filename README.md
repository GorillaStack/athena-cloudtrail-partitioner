# Athena CloudTrail Partitioner

This project helps you periodically add partitions to your Athena/Glue database for each day/month/year/region/account added to your CloudTrail log bucket.

[Read more about why we built this, and how it can be used, in this blog post]().

## Prerequisite - Enable CloudTrail

CloudTrail is an audit log of every action to occur in your AWS Action. It should be on all the time.

You can now [enable CloudTrail at the AWS Organization level](https://docs.aws.amazon.com/organizations/latest/userguide/services-that-can-integrate-ct.html), which means that CloudTrail for each account will be centrally logged and automatically enabled for all new accounts.

Read about how to [create your organization CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html) here.

## Installation

Install the Athena CloudTrail Partitioner through CloudFormation, either through the AWSCLI:

```
aws cloudformation deploy \
  --stack-name athena-cloudtrail-partitioner \
  --region ${AWS_DEFAULT_REGION} \
  --template-file cf/template.yml \
  --force-upload \
  --parameter-overrides \
    "OrganizationId=${ORGANIZATION_ID}" \
    "S3BucketName=${S3_BUCKET_NAME}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset
```

or click this button to deploy throught the AWS Console:

[![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/quickcreate?stackName=athena-cloudtrail-partitioner&templateUrl=https%3A%2F%2Fgorillastack-cloudformation-templates.s3.amazonaws.com%2Fathena-cloudtrail-partitioner.yml)
