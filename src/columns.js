export const COLUMNS = [
  {
    Name: 'useridentity',
    Type: 'struct<type:string,principalid:string,arn:string,accountid:string,sessioncontext:struct<attributes:struct<mfaauthenticated:string,creationdate:string>,sessionissuer:struct<type:string,principalid:string,arn:string,accountid:string,username:string>,webidfederationdata:string>,invokedby:string,accesskeyid:string,username:string,identityprovider:string>',
  },
  {
    Name: 'eventversion',
    Type: 'string',
  },
  {
    Name: 'eventtime',
    Type: 'string',
  },
  {
    Name: 'eventtype',
    Type: 'string',
  },
  {
    Name: 'eventsource',
    Type: 'string',
  },
  {
    Name: 'eventname',
    Type: 'string',
  },
  {
    Name: 'awsregion',
    Type: 'string',
  },
  {
    Name: 'sourceipaddress',
    Type: 'string',
  },
  {
    Name: 'useragent',
    Type: 'string',
  },
  {
    Name: 'errorcode',
    Type: 'string',
  },
  {
    Name: 'errormessage',
    Type: 'string',
  },
  {
    Name: 'requestparameters',
    Type: 'string',
  },
  {
    Name: 'responseelements',
    Type: 'string',
  },
  {
    Name: 'additionaleventdata',
    Type: 'string',
  },
  {
    Name: 'requestid',
    Type: 'string',
  },
  {
    Name: 'eventid',
    Type: 'string',
  },
  {
    Name: 'resources',
    Type: 'array<struct<arn:string,accountid:string,type:string>>',
  },
  {
    Name: 'apiversion',
    Type: 'string',
  },
  {
    Name: 'readonly',
    Type: 'string',
  },
  {
    Name: 'recipientaccountid',
    Type: 'string',
  },
  {
    Name: 'serviceeventdetails',
    Type: 'string',
  },
  {
    Name: 'sharedeventid',
    Type: 'string',
  },
  {
    Name: 'vpcendpointid',
    Type: 'string',
  }
];

export default COLUMNS;
