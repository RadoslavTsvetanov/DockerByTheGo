minikube create namespace monitroing
kubectl apply -f secret.yml
helm install -n prometheus prometheus-community/kube-prometheus-stack -f values.yaml
echo "port forward the grafana service"