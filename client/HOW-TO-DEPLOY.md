# Making a Container
## Step-By-Step
The following are the list of commands needed to create a container. The commands container variables that are intended to be REPLACED by the proper values for a specific user, service, repository, etc. Each variable is marked with "<>".

1. This command creates the image of your container
```bash
docker buildx build --platform=linux/amd64 -t <image-name> .
```

---

<br>

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

## Quick-Use-Script
Use the `deploy-container.sh` script to automatically build the image, containerize the image, and publish the image to AWS ECR.

```bash
 ./deploy-container.sh
```

---

### First time using the script?
Make the script excecutable for you by navigating to it (`cd client/react`) and running the below command
```bash
chmod +x deploy-container.sh
```

---

#### Script Code Preview
```bash
#!/bin/bash

# Define variables
IMAGE_NAME="stu_rec_client_v0-1-1"
AWS_ACCOUNT_ID="216990846240"
REGION="us-east-2"
ECR_REPO="cis-4203-24-25"

# 1. Build the Docker image
echo "Building Docker image..."
docker buildx build --platform=linux/amd64 -t $IMAGE_NAME .

# 2. Log in to AWS ECR
echo "Logging in to AWS ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO

# 3. Obtain the image tag
# echo "Listing Docker images..."
# docker images

# 4. Tag the Docker image
echo "Tagging Docker image..."
docker tag $IMAGE_NAME $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:$IMAGE_NAME

# 5. Push the image to ECR
echo "Pushing Docker image to AWS ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:$IMAGE_NAME

echo "Done!"
```

---

# Using AWS AppRunner
## Deploy Container App
## Step 1: Select your image.
* Choose the image from the repository, then click "Use existing role" and select "AppRunnerECRAccessRole". 
* Click "Next"
<br>

---

## Step 2: Set environment variable & port. 
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