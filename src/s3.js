import aws from 'aws-sdk';


const createNode = (name, children) => ({ name, children });

/**
 * list the given bucket at the given path
 *
 * @param {String} bucket
 * @param {String} path
 */
export const listBucketAtPath = (bucket, path) => new Promise((resolve, reject) => {
  const s3 = new aws.S3({ apiVersion: '2006-03-01' });
  s3.listObjectsV2({ Bucket: bucket, Prefix: path, Delimiter: '/' }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

/**
 * Methods for finding candidate subpaths for partitioning
 */
export const mapLastPrefixesNumber = contents => contents.CommonPrefixes
  .map(prefix => prefix.Prefix.replace(/^.*\/(\d+)\/$/, '$1'));

export const mapLastPrefixesRegion = contents => contents.CommonPrefixes
  .map(prefix => prefix.Prefix.replace(/^.*\/([a-z1-9\-]+)\/$/, '$1'));

export const getAccounts = async (bucket, path) => {
  const contents = await listBucketAtPath(bucket, path);
  return mapLastPrefixesNumber(contents);
};

export const getRegions = async (bucket, path, account) => {
  const contents = await listBucketAtPath(bucket, `${path}${account}/CloudTrail/`);
  return mapLastPrefixesRegion(contents);
};

export const getYears = async (bucket, path, account, region) => {
  const contents = await listBucketAtPath(bucket, `${path}${account}/CloudTrail/${region}/`);
  return mapLastPrefixesNumber(contents);
};

export const getMonths = async (bucket, path, account, region, year) => {
  const contents = await listBucketAtPath(bucket, `${path}${account}/CloudTrail/${region}/${year}/`);
  return mapLastPrefixesNumber(contents);
};

export const getDays = async (bucket, path, account, region, year, month) => {
  const contents = await listBucketAtPath(bucket, `${path}${account}/CloudTrail/${region}/${year}/${month}/`);
  return mapLastPrefixesNumber(contents);
};


const createMonthNode = async (bucket, path, account, region, year, month) => {
  const days = await getDays(bucket, path, account, region, year, month);
  return createNode(month, days);
};

const createYearNode = async (bucket, path, account, region, year) => {
  const months = await getMonths(bucket, path, account, region, year);
  const monthNodes = await Promise.all(months.map(month => createMonthNode(bucket, path, account, region, year, month)));
  return createNode(year, monthNodes);
};

const createRegionNode = async (bucket, path, account, region) => {
  const years = await getYears(bucket, path, account, region);
  const yearNodes = await Promise.all(years.map(year => createYearNode(bucket, path, account, region, year)));
  return createNode(region, yearNodes);
};

const createAccountNode = async (bucket, path, account) => {
  const regions = await getRegions(bucket, path, account);
  const regionNodes = await Promise.all(regions.map(region => createRegionNode(bucket, path, account, region)));
  return createNode(account, regionNodes);
};

/**
 * get a tree of all partition key sets, broken down by order
 *
 * @param {String} bucket
 * @param {String} path
 */
export const getAllParitions = async (bucket, path) => {
  const accounts = await getAccounts(bucket, path);
  return Promise.all(accounts.map(account => createAccountNode(bucket, path, account)));
};
