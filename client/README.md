## Making a Container
The following are the list of commands needed to create a container. The commands container variables that are intended to be REPLACED by the proper values for a specific user, service, repository, etc. Each variable is marked with "<>".

1. This command creates the image of your container
```bash
docker buildx build --platform=linux/amd64 -t <image-name> .
```

<br>

2. This command logs into your AWS account
```bash
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 216990846240.dkr.ecr.us-east-2.amazonaws.com/cis-4203-24-25
```

<br>

3. This command is used to obtain the image tag of the image created in the first command.
```bash
docker images
```

<br>

4. This command tags your image with a readable name
```bash
docker tag <imageTag> 216990846240.dkr.ecr.us-east-2.amazonaws.com/cis-4203-24-25:<image-name>
```

<br>

5. This command pushes your image to your elastic container repository
```bash
docker push 216990846240.dkr.ecr.us-east-2.amazonaws.com/cis-4203-24-25:<image-name>
```


```bash
```