kubectl create namespace kafka
kubectl apply -f https://strimzi.io/install/latest?namespace=kafka -n kafka
kubectl apply -f kafka-cluster.yml -n kafka
