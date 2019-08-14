import { getAllParitions } from './s3';
import { constructNewPartitionKeySetsFromTree } from './store';
import { createAllPartitions } from './partition';

/**
* Parameters (env vars)
*
* 1) BUCKET_NAME - name of the bucket containing the CloudTrail logs
* 2) ORG_ID - the id of the AWS Organization to consider when creating/partitioning the database
* 3) DATABASE - the name of the Athena database in which you want to create the table
* 4) TABLE_NAME - the name of the table to create in the Athena database in DATABASE
*/
export const handler = async (event, context) => {
  // console.log('Received event:', JSON.stringify(event, null, 2));
  const { BUCKET_NAME: bucket, ORGANIZATION_ID: orgId } = process.env;
  const path = orgId ? `AWSLogs/${orgId}/` : 'AWSLogs/';
  const partitionTree = await getAllParitions(bucket, path);
  console.log(JSON.stringify(partitionTree));
  const partitions = await constructNewPartitionKeySetsFromTree(partitionTree);
  console.log('Partitions');
  console.log(JSON.stringify(partitions));
  await createAllPartitions(partitions, bucket, path);
};

export default handler;
