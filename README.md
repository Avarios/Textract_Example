# Textract Demo

This PoC contains code intended to show how to extract text patterns from documents using Amazon Textract and store the results into DynamoDB

In this example following services where used:

- [Amazon Textract](https://aws.amazon.com/textract/)
- [Amazon API Gateway](https://aws.amazon.com/api-gateway)
- [AWS Lambda](https://aws.amazon.com/lambda)
- [Amazon DynamoDB](https://aws.amazon.com/dynamodb/?nc2=h_ql_prod_db_ddb)
- [Amazon SNS](https://aws.amazon.com/sns/?nc2=h_ql_prod_ap_sns&whats-new-cards.sort-by=item.additionalFields.postDateTime&whats-new-cards.sort-order=desc)
- [Amazon SQS](https://aws.amazon.com/sqs/?nc2=h_ql_prod_ap_sqs)
- [Amazon S3](https://aws.amazon.com/s3/?nc2=h_ql_prod_st_s3)
- [AWS CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html)

You can find the whole aws backend stack build with [AWS-CDK](https://aws.amazon.com/de/cdk/) in `./aws/lib`

## Caveats:

**Using this template is not covered by free tier**

**This code is intended as an example of how to accomplish the described use case to be used as a reference and is not intended for production**

**Node.js versions 13.0.0 through 13.6.0 are not compatible with the AWS CDK**

**We strongly recommend against using your AWS root account for day-to-day tasks. Instead, create a user in IAM and use its credentials with the CDK.**

**If you configure this solution always use the IRELAND Region (eu-west-1). If not Textract will not work**

## Prerequisites

First you need to [install Node.js](https://nodejs.org/en/download/) 10.3.0 or later. The AWS CDK Toolkit (cdk command-line tool) and the AWS Construct Library are developed in TypeScript and run on Node.js. The bindings for other supported languages use this back end and tool set. We suggest the latest LTS version.

You must provide your credentials and an AWS Region to use AWS CDK, if you have not already done so.

If you have the [AWS CLI](https://aws.amazon.com/de/cli/) installed, the easiest way to satisfy this requirement is to install the AWS CLI and issue the following command:

```json
aws configure
````

Provide your AWS access key ID, secret access key, and default region when prompted.

You may also manually create or edit the  `~/.aws/config` and  `~/.aws/credentials` (Linux or Mac) or `%USERPROFILE%\.aws\config` and `%USERPROFILE%\.aws\credentials` (Windows) files to contain credentials and a default region, in the following format.

In ~/.aws/config or %USERPROFILE%\.aws\config

    [default]
    region=eu-west-1

In ~/.aws/credentials or %USERPROFILE%\.aws\credentials

    [default]
    aws_access_key_id=AKIAI44QH8DHBEXAMPLE
    aws_secret_access_key=je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY

Finally, you can set the environment variables AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION to appropriate values.

For working with this example you need Typescript so you have to install it by

    npm -g install typescript

## Install the AWS CDK

Install the AWS CDK Toolkit globally using the following Node Package Manager command.

    npm install -g aws-cdk

Run the following command to verify correct installation and print the version number of the AWS CDK.

    cdk --version

Atfer you installed all frameworks and tools move on to setup and deploy the application

## Setup and deploy the application ##
1. Open your terminal and go to the cloned source folder
2. Change to the folder `aws`
3. Type in `npm install` and press `Enter`
4. Now type in `npm run cdk`. You should see the whole cloudformation template in the terminal.
5. If prompted, press `Y`for deploying the stack. After the script is finished your AWS resources are deployed.
Copy and Paste the URL that is in the Stack output in the Terminal

6. Now switch to the root folder and go the `frontend` folder

7. Make a new file `.env`

8. In this file please add those two lines : 

    `VUE_APP_API_GATEWAY_URL=<<YOUR_API_URL>>`

    `VUE_APP_API_KEY=<<YOUR_API_KEY>>`

    In `<<YOUR_API_URL>>` you have to paste the copied URL from the stack output.

9. To get the API Key login to your aws console. 
10. Switch to the Region Ireland.
11. Go to the Services and search for Amazon API Gateway.
12. Open your API and go to the API Key section on the left side. Click on `Show` and copy the value.
13. Open your `.env` file again and paste your API Key to `<<YOUR_API_KEY>>`
14. Run `npm install` and press `Enter`.
15. Now type in `npm run serve`. A development server is up and running and you can open the webbrowser and type in the URL you can find in the console.

### Disclaimer ###
This code is intended as an example of how to accomplish the described use case to be used as a reference and is not intended for production
If you produce any system based on this code we recommend you to run a [Well-Architected Review](https://aws.amazon.com/de/architecture/well-architected/) over it before deploying into a production environment. 

This example is published under the [Apache License 2.0](./LICENSE)
