## Table of Contents

- [Making a Container](#making-a-container)
    - [Build Image](#build-image)
    - [Push to AWS](#push-to-aws)
    - [Quick-Use-Script](#quick-use-script)
    - [Running Container Locally](#running-container-locally)
- [Using AWS AppRunner](#using-aws-apprunner)
  - [Step 1: Select your image.](#step-1-select-your-image)
  - [Step 2: Set environment variable & port.](#step-2-set-environment-variable--port)
  - [Step 3: Permissions.](#step-3-permissions)
  - [Step 4: Deploy.](#step-4-deploy)


# CONTAINERIZING CLIENT SIDE REACT APP
## Making a Container
The following are the list of commands needed to create the client container. The commands' container variables are intended to be REPLACED by the proper values for a specific user, service, repository, etc. Each variable is marked with "<>".

0. Start by navigating to the react folder in `client/react`

---

### Build Image
1. This command creates the image of your container
```bash
docker buildx build --platform=linux/amd64 -t <image-name> .
```

---

**At this point** you can either choose to push the container to AWS, or run it locally. To push to AWS, continue on with steps 2-5. To run container locally, skip to [Running Container Locally](#running-container-locally).

<br>

### Push to AWS
2. This command logs into your AWS account
```bash
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 216990846240.dkr.ecr.us-east-2.amazonaws.com/cis-4203-24-25
```

---

<br>

3. This command is used to obtain the image tag of the image created in the first command.
```bash
docker images
```

---

<br>

4. This command tags your image with a readable name
```bash
docker tag <imageTag> 216990846240.dkr.ecr.us-east-2.amazonaws.com/cis-4203-24-25:<image-name>
```

---

<br>

5. This command pushes your image to your elastic container repository
```bash
docker push 216990846240.dkr.ecr.us-east-2.amazonaws.com/cis-4203-24-25:<image-name>
```

---

### Quick-Use-Script
Use the `deploy-container.sh` script to automatically build the image, containerize the image, and publish the image to AWS ECR.

```bash
 ./deploy-container.sh
```

---

**First time using the script?**
Make the script excecutable for you by navigating to it (`cd client/react`) and running the below command
```bash
chmod +x deploy-container.sh
```

---

### Running Container Locally
Open docker desktop and find the image you created in step 1. Click run, then open the image on the specified port. 


# Using AWS AppRunner
**Deploying Container App**
## Step 1: Select your image.
* Choose the image from the repository, then click "Use existing role" and select "AppRunnerECRAccessRole". 
* Click "Next"
<br>

---

## Step 2: Set environment variable & port. 
**_NOTE: This information is subject to change in future deployments_**
* Name your deployment something descriptive. It is recommended to have some sort of incremental version reference standard. 
* Add the `REACT_APP_API_BASE_URL` environment variable. Use the values in the table below:

    | Format or Source | Name | Value |
    | ---------------- | ---- | ----- |
    | Plain text | REACT_APP_API_BASE_URL | http://127.0.0.1:5555 (or some other API URL) |

* Change the Port to be the port referenced in the Dockerfile (In this case `80`).
<br>

---

## Step 3: Permissions. 
* Give your service the neccessary security permission. Apply "(someRole)". Your service will likely not work without this.
* Click "Next"
<br>

---

## Step 4: Deploy. 
* Confirm all your settings are correct, then scroll to the bottom of the page and click "Create & deploy". 