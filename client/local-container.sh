IMAGE_NAME="stu_rec_client_v0-0-0"
DOCKER_PORT_NUMBER="3000"
LOCAL_PORT_NUMBER="80"
API_URL="http://localhost:5555"

docker buildx build --platform=linux/amd64 --build-arg REACT_APP_API_BASE_URL=$API_URL -t $IMAGE_NAME .
docker run -p $DOCKER_PORT_NUMBER:$LOCAL_PORT_NUMBER $IMAGE_NAME