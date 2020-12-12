echo hello
echo What is the version of docker image supposed to be?
read VERSION
docker build -t mayhemant/reddit:$VERSION .
docker push mayhemant/reddit:$VERSION