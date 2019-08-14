import AWS from 'aws-sdk';
import { flatten } from 'lodash';

AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });

/* Helpers */
const createPartitionRecordsMonthLevel = (account, region, year, month, days) => days.map(
  day => ({ account, region, year, month, day }));
const createPartitionRecordsYearLevel = (account, region, year, months) => months.map(
  ({ name: month, children: days }) => flatten(createPartitionRecordsMonthLevel(account, region, year, month, days)));
const createPartitionRecordsRegionLevel = (account, region, years) => years.map(
  ({ name: year, children: months }) => flatten(createPartitionRecordsYearLevel(account, region, year, months)));
const createPartitionRecordsAccountLevel = (account, regions) => regions.map(
  ({ name: region, children: years }) => flatten(createPartitionRecordsRegionLevel(account, region, years)));

/* Persistence */
export const createPartitionDomainKey = (account, region, year, month, day) => `${account}/${region}/${year}/${month}/${day}`;
export const hasSomePartitionsForPath = partitionDomainKey => new Promise((resolve, reject) => {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    Key: {
      Domain: { S: partitionDomainKey },
    },
    TableName: 'Athena-CloudTrail-Partitions',
  };
  dynamodb.getItem(params, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(typeof data.Item !== 'undefined');
    }
  });
});

export const savePartitionRecordForPath = partitionDomainKey => new Promise((resolve, reject) => {
  const dynamodb = new AWS.DynamoDB();
  const params = {
    Item: {
      Domain: { S: partitionDomainKey },
      Date: { S: (new Date()).toISOString() },
    },
    TableName: 'Athena-CloudTrail-Partitions',
  };
  dynamodb.putItem(params, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

/* Checks for each level of the tree */

export const constructPartitionsForNewMonthOrCheckDays = async (account, region, year, month, days) => {
  // check for record of region in dynamo db
  const recordFound = await hasSomePartitionsForPath(`${account}/${region}/${year}/${month}`);
  if (!recordFound) {
    // If no record, create partitions for all paths under the account in this tree
    return createPartitionRecordsMonthLevel(account, region, year, month, days);
  } else {
    // otherwise, check for each day
    const partitions = await Promise.all(days.map(async day => {
      const recordFoundForDay = await hasSomePartitionsForPath(`${account}/${region}/${year}/${month}/${day}`);
      return recordFoundForDay ? null : ({ account, region, year, month, day });
    }));
    return partitions.filter(partition => partition !== null);
  }
};

export const constructPartitionsForNewYearOrCheckMonths = async (account, region, year, months) => {
  // check for record of region in dynamo db
  const recordFound = await hasSomePartitionsForPath(`${account}/${region}/${year}`);
  if (!recordFound) {
    // If no record, create partitions for all paths under the account in this tree
    return createPartitionRecordsYearLevel(account, region, year, months);
  } else {
    // otherwise, check for each month
    const partitions = await Promise.all(months.map(
      ({ name: month, children: days }) => constructPartitionsForNewMonthOrCheckDays(account, region, year, month, days)));
    return flatten(partitions);
  }
};

export const constructPartitionsForNewRegionOrCheckYears = async (account, region, years) => {
  // check for record of region in dynamo db
  const recordFound = await hasSomePartitionsForPath(`${account}/${region}`);
  if (!recordFound) {
    // If no record, create partitions for all paths under the account in this tree
    return createPartitionRecordsRegionLevel(account, region, years);
  } else {
    // otherwise, check for each year
    const partitions = await Promise.all(years.map(
      ({ name: year, children: months }) => constructPartitionsForNewYearOrCheckMonths(account, region, year, months)));
    return flatten(partitions);
  }
};

export const constructPartitionsForNewAccountOrCheckRegions = async (account, regions) => {
  // check for record of account in dynamo db
  const recordFound = await hasSomePartitionsForPath(account);
  if (!recordFound) {
    // If no record, create partitions for all paths under the account in this tree
    return createPartitionRecordsAccountLevel(account, regions);
  } else {
    // otherwise, check for each region
    const partitions = await Promise.all(regions.map(
      ({ name: region, children: years }) => constructPartitionsForNewRegionOrCheckYears(account, region, years)))
    return flatten(partitions);
  }
};

/**
 * accepts a partition tree and checks each tier of the key hierarchy to determine
 * which subsets of available paritions require creation
 *
 * @param {Array} partitionTree
 */
export const constructNewPartitionKeySetsFromTree = async partitionTree => {
  const partitions = await Promise.all(partitionTree.map(
    ({ name: account, children: regions }) => constructPartitionsForNewAccountOrCheckRegions(account, regions)));
  return flatten(flatten(partitions));
};
