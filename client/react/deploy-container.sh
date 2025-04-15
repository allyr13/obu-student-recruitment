#!/bin/bash

# Define variables
IMAGE_NAME="stu_rec_client_v0-0-4"
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
