import { CachePolicy, Distribution, OriginAccessIdentity } from "@aws-cdk/aws-cloudfront";
import { S3Origin } from "@aws-cdk/aws-cloudfront-origins";
import * as nodeLambda from '@aws-cdk/aws-lambda-nodejs';
import { Bucket, BucketAccessControl } from "@aws-cdk/aws-s3";
import { BucketDeployment, CacheControl, Source } from "@aws-cdk/aws-s3-deployment";
import * as cdk from '@aws-cdk/core';
import { Construct, SecretValue, Stack } from '@aws-cdk/core';
import { Skill } from 'cdk-alexa-skill';
import { env } from "process";

export class AlexaCdkStack extends Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const bucketName = `alexa-webapi-assets-${env.AWS_ACCOUNT_ID}-${env.AWS_REGION}`
        const bucket = new Bucket(this, 'Bucket', {
            bucketName: bucketName,
            accessControl: BucketAccessControl.PRIVATE,
        });

        new BucketDeployment(this, 'BucketDeployment', {
            destinationBucket: bucket,
            sources: [Source.asset('dist/webapp')],
            cacheControl: [CacheControl.noCache()]
        });

        const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
        bucket.grantRead(originAccessIdentity);

        const distribution = new Distribution(this, 'Distribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new S3Origin(bucket, { originAccessIdentity }),
                cachePolicy: CachePolicy.CACHING_DISABLED
            },
        });

        // Create the Lambda Function for the Skill Backend
        const skillBackend = new nodeLambda.NodejsFunction(this, 'SkillBackend', {
            environment: {
                WEBAPP_ORIGIN: distribution.domainName
            },
            entry: 'lib/lambda-handler.ts',
            timeout: cdk.Duration.seconds(7)
        });

        // Create the Alexa Skill
        new Skill(this, 'Skill', {
            endpointLambdaFunction: skillBackend,
            skillPackagePath: 'skill-package',
            alexaVendorId: process.env.ALEXA_VENDOR_ID as string,
            lwaClientId: process.env.LWA_CLIENT_ID as string,
            lwaClientSecret: process.env.LWA_CLIENT_SECRET as unknown as SecretValue,
            lwaRefreshToken: process.env.LWA_CLIENT_REFRESH_TOKEN as unknown as SecretValue
        });
    }
}
