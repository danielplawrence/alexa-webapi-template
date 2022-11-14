
# Alexa WebApi Skill Template

This repository provides a basic template for deploying an Alexa Skill using the [WebAPI for games](https://developer.amazon.com/en-US/docs/alexa/web-api-for-games/alexa-games-about.html) using the AWS CDK.

It creates:

- An Alexa Skill configured to use the WebAPI for Games.
- A Lambda handler to provide the skill backend.
- An S3 bucket and cloudfront distribution which serves a web app to use in your WebAPI game.

The skill is currently very simple, and just prints the Alexa request to the screen when the user says "Say {{some phrase}}". This is intended to demonstrate sending a message from the skill backend to the client-side Javascript. The code also has a cloud-side logging utility (see `webapp/logging.ts`) which demonstrates how to send messages from the client to the skill backend.

### Pre-requisites

**Amazon Developer Account**

*Go to https://developer.amazon.com/ and register.*

**AWS Account**

*Go to https://aws.amazon.com/ and create an account.*

**NodeJS**

*Download NodeJS and NPM following the instructions [here](https://nodejs.org/en/download/)*.

**ASK CLI**

*After installing Node*:
```
npm install -g ask-cli
```
**AWS CLI**

*After installing Node*:
```
npm install -g aws-cli
```
### Steps

1. Configure AWS credentials:

```
aws configure
```

*Provide your AWS access key ID, secret access key, and default Region when prompted.*

2. Create Login With Amazon profile:

*The Alexa Skill Management API utilizes Login with Amazon (LWA) for authentication, so first we must create a security profile for LWA under the same Amazon account that we will use to create the Alexa Skill.*

- *Navigate to the [LWA console](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html) and login with your Amazon account.*

- *Click the “Create a New Security Profile” button:*

![image](/images/new_security_profile.png)

- *Fill out the form with a Name, Description, and Consent Privacy Notice URL (this can just be 'https://www.amazon.com'), and then click “Save”.*

![image](/images/creating_security_profile.png)

- *The new Security Profile should now be listed. Hover over the gear icon, located to the right of the new profile name, and click “Web Settings”.*

![image](/images/finding_web_settings.png)

- *Click the “Edit” button and add the following under “Allowed Return URLs”:*
  - *http://127.0.0.1:9090/cb*
  - *https://s3.amazonaws.com/ask-cli/response_parser.html*

- *Click the “Save” button to save your changes.*
- *Click the “Show Secret” button to reveal your Client Secret. Make a note of your Client ID and Client Secret.*

![image](/images/final_security_profile.png)

3. Generate Login With Amazon tokens

**Configure the ASK CLI**

*From the root of this repository, run:*

```
npx ask configure
```
*Use the arrow keys to select [default], then press Enter. The ASK CLI will open your web browser and ask you to log in with the username and password you used when creating your Amazon Developer account. After completing this step, you should see the text*:

```
Vendor ID set as <some string value>
```
*Make a note of this value.*

**Get a refresh token**

*Your Client ID and Client Secret (retrieved in the previous step) allow you to generate a refresh token for authenticating with the ASK service.*

*Navigate to your local Terminal and enter the following command, replacing <your Client ID> and <your Client Secret> with your Client ID and Client Secret, respectively:*

```bash
npx ask util generate-lwa-tokens --client-id "<your Client ID>" --client-confirmation "<your Client Secret>" --scopes "alexa::ask:skills:readwrite alexa::ask:models:readwrite"
```

*A browser window should open with a login screen. Supply credentials for the same Amazon account with which you created the LWA Security Profile previously.*

*Click the “Allow” button to grant the refresh token appropriate access to your Amazon Developer account.*

*Return to your Terminal. The credentials, including your new refresh token, should be printed. Note the value in the refresh_token field.*

4. Update `profile.env`:

*Update the `profile.env` file with the vendor ID, client ID, client secret, refresh token, and aws account information retrieved in the previous steps:*

```bash
export ALEXA_VENDOR_ID="" # vendor id retrieved from ask cli
export LWA_CLIENT_ID="" # client id from login with amazon profile
export LWA_CLIENT_SECRET="" # client secret from login with amazon profile
export LWA_CLIENT_REFRESH_TOKEN="" # refresh token generated using npx ask util generate-lwa-tokens command
export AWS_ACCOUNT_ID="" # ID of your AWS account
export AWS_REGION="" # region you wish to deploy to e.g. us-east-1
```

**Note: avoid committing the contents of profile.env, as it contains credentials!**

5. Bootstrap AWS account for CDK:

```
npm run build && npm run cdk bootstrap
```

*This will prepare your AWS account with necessary resources for working with the CDK*.

4. Build and deploy the template

```
npm run build && npm run deploy
```
*You should see output from CDK indicating that your stack is being created. Once you see the "✨ Deployment time: ..." message, you are ready to go!*

### To view the generated resources:

1. *Go to the AWS console, find the "Cloudformation" console and look for "AlexaCdkStack". You should see a list of resources created under "Resources".*

2. *Go to the Alexa Developer Console (https://developer.amazon.com/alexa/console/ask/). You should be able to see your skill there.*

### To try out the skill:

***Note that you will need a multimodal Alexa Device, such as an Echo Show, to test this skill.***

1. *Go to the Alexa Developer Console (https://developer.amazon.com/alexa/console/ask/). Find your skill.*

2. *Click on the skill, then find the "Test" tab.*

3. *You should see the option to enable the skill for testing in the top left-hand corner of the screen. Set this to "Skill testing is enabled in: Development".*

4. *Make sure you are logged in to your Alexa device with the same account that you used to log in to the developer console. You should now be able to interact with the skill.*

    - *Say "Alexa, open game template" to open the skill.*
    
    - *Say "Alexa, say 'hello'" to see the Alexa request objected printed to the screen -- this demonstrates how messages can be sent from the skill to the Javascript code running in the web app.*


### Making changes

**To edit the webapp**, edit the files under the webapp/ directory. The following commands may be helpful during development:

`npm run serve` will run a local version of the webapp  
`npm run sync` will do a fast deployment of the webapp assets to the cloud
`npm run build && npm run deploy` will do a full deployment.

**To edit the skill backend**, edit `lib/lambda-handler.ts`. 
You can use `npm run sync` to quickly deploy changes to the cloud during development, and `npm run deploy` will do a full deployment of the lambda.


**To edit the skill definition**, edit the files inside `skill-package/`. To deploy these changes, run `npm run deploy`. 


Please see the [WebAPI docs](https://developer.amazon.com/en-US/docs/alexa/web-api-for-games/alexa-games-about.html) for further details on WebAPI functionality, and check out https://github.com/alexa-samples/skill-sample-nodejs-web-api-my-cactus for an example of a fully-fledged game.
