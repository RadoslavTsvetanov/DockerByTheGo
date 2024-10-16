minikube create namespace monitroing

echo "hi"

kubectl apply -f secret.yml

echo "hi"

helm install -n prometheus --generate-name prometheus-community/kube-prometheus-stack -f values.yaml
echo "port forward the grafana service"
