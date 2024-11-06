ls
export IMG=radoslav123/opertaor:latest
make docker-build 
make docker-push
make undeploy
make deploy