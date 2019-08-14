import AWS from 'aws-sdk';
import { savePartitionRecordForPath } from './store';

AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });

/**
 * batchCreatePartition
 *
 * A batch of no more than 100 partitions to create as a batch in AWS Glue
 * @param {Object} glue - AWS Glue service object
 * @param {Object} partitions - Array of up to 100 partitions
 */
export const batchCreatePartition = (glue, partitions, bucket, path) => new Promise((resolve, reject) => {
  console.log(`Attempting to create ${partitions.length} partitions`);
  glue.batchCreatePartition({
    DatabaseName: 'default',
    TableName: 'cloudtrail_logs',
    PartitionInputList: partitions.map(({ account, region, year, month, day }) => ({
      Values: [account, region, year, month, day],
      StorageDescriptor: {
        Location: `s3://${bucket}/${path}${account}/CloudTrail/${region}/${year}/${month}/${day}`,
      },
    })),
  }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

/**
 * createAllPartitions
 *
 * creates all listed partitions in separate batch requests
*/
export const createAllPartitions = async (partitions, bucket, path) => {
  const glue = new AWS.Glue({ apiVersion: '2017-03-31' });

  while (partitions.length > 0) {
    const batch = partitions.splice(0, 100);
    await batchCreatePartition(glue, batch, bucket, path);
    await Promise.all(batch
      .map(({ account, region, year, month, day }) => savePartitionRecordForPath(`${account}/${region}/${year}/${month}/${day}`)));
  }
};
