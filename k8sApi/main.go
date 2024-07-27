package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	appsv1 "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

var clientset *kubernetes.Clientset

func getK8sClient() (*kubernetes.Clientset, error) {
	if clientset != nil {
		return clientset, nil
	}

	var kubeconfig *string
	if home := homeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()

	config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		return nil, err
	}

	clientset, err = kubernetes.NewForConfig(config)
	return clientset, err
}

func createNamespace(namespace string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	ns := &v1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: namespace,
		},
	}

	_, err = clientset.CoreV1().Namespaces().Create(context.Background(), ns, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("Namespace %s created successfully.\n", namespace)
	return nil
}

func fetchAndPrintPods(namespace string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	pods, err := clientset.CoreV1().Pods(namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("Pods in namespace %s:\n", namespace)
	for _, pod := range pods.Items {
		fmt.Printf("- Pod Name: %s\n  Namespace: %s\n  Node: %s\n  Status: %s\n",
			pod.Name, pod.Namespace, pod.Spec.NodeName, pod.Status.Phase)
	}

	return nil
}

func fetchAndPrintServices(namespace string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	services, err := clientset.CoreV1().Services(namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("\nServices in namespace %s:\n", namespace)
	for _, svc := range services.Items {
		fmt.Printf("- Service Name: %s\n  Type: %s\n  ClusterIP: %s\n  Ports: %v\n",
			svc.Name, svc.Spec.Type, svc.Spec.ClusterIP, svc.Spec.Ports)
	}

	return nil
}

func fetchAndPrintDeployments(namespace string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	deployments, err := clientset.AppsV1().Deployments(namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("\nDeployments in namespace %s:\n", namespace)
	for _, deploy := range deployments.Items {
		fmt.Printf("- Deployment Name: %s\n  Replicas: %d/%d\n  Selector: %v\n",
			deploy.Name, deploy.Status.ReadyReplicas, *deploy.Spec.Replicas, deploy.Spec.Selector.MatchLabels)
	}

	return nil
}

func fetchAndPrintConfigMaps(namespace string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	configMaps, err := clientset.CoreV1().ConfigMaps(namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("\nConfigMaps in namespace %s:\n", namespace)
	for _, cm := range configMaps.Items {
		fmt.Printf("- ConfigMap Name: %s\n  Data: %v\n", cm.Name, cm.Data)
	}

	return nil
}

func fetchAndPrintSecrets(namespace string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	secrets, err := clientset.CoreV1().Secrets(namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("\nSecrets in namespace %s:\n", namespace)
	for _, secret := range secrets.Items {
		fmt.Printf("- Secret Name: %s\n  Type: %s\n", secret.Name, secret.Type)
	}

	return nil
}

func fetchAndPrintAllResources(namespace string) error {
	if err := fetchAndPrintPods(namespace); err != nil {
		return err
	}
	if err := fetchAndPrintServices(namespace); err != nil {
		return err
	}
	if err := fetchAndPrintDeployments(namespace); err != nil {
		return err
	}
	if err := fetchAndPrintConfigMaps(namespace); err != nil {
		return err
	}
	if err := fetchAndPrintSecrets(namespace); err != nil {
		return err
	}
	return nil
}

func createPod(namespace, name, image string, envVars map[string]string, containerPorts []v1.ContainerPort) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	var env []v1.EnvVar
	for key, value := range envVars {
		env = append(env, v1.EnvVar{
			Name:  key,
			Value: value,
		})
	}

	pod := &v1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:   name,
			Labels: map[string]string{"app": name},
		},
		Spec: v1.PodSpec{
			Containers: []v1.Container{
				{
					Name:  name,
					Image: image,
					Env:   env,
					Ports: containerPorts,
				},
			},
		},
	}
	_, err = clientset.CoreV1().Pods(namespace).Create(context.Background(), pod, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("Pod %s created successfully in namespace %s.\n", name, namespace)
	return nil
}

func createService(namespace, name string, port int32, serviceType v1.ServiceType) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	service := &v1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
			Labels: map[string]string{
				"app": name,
			},
		},
		Spec: v1.ServiceSpec{
			Selector: map[string]string{
				"app": name,
			},
			Ports: []v1.ServicePort{
				{
					Port:       port,
					TargetPort: intstr.FromInt(int(port)),
				},
			},
			Type: serviceType,
		},
	}
	_, err = clientset.CoreV1().Services(namespace).Create(context.Background(), service, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("Service %s created successfully in namespace %s.\n", name, namespace)
	return nil
}

func defaultHandleError(e error) {
	if e != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", e)
	}
}

func homeDir() string {
	if h := os.Getenv("HOME"); h != "" {
		return h
	}
	return os.Getenv("USERPROFILE") // Windows
}

// CreateDeployment creates a Kubernetes Deployment in the specified namespace
func CreateDeployment(namespace, name, image string, replicas int32, env map[string]string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	var envVars []v1.EnvVar
	for key, value := range env {
		envVars = append(envVars, v1.EnvVar{
			Name:  key,
			Value: value,
		})
	}

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": name},
			},
			Template: v1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": name},
				},
				Spec: v1.PodSpec{
					Containers: []v1.Container{
						{
							Name:  name,
							Image: image,
							Ports: []v1.ContainerPort{
								{
									ContainerPort: 80,
								},
							},
							Env: envVars,
						},
					},
				},
			},
		},
	}

	deploymentClient := clientset.AppsV1().Deployments(namespace)
	result, err := deploymentClient.Create(context.TODO(), deployment, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("error creating deployment: %v", err)
	}

	fmt.Printf("Created deployment %q in namespace %s.\n", result.GetObjectMeta().GetName(), namespace)
	return nil
}

type StringOrNil interface{}

func CreateUnmanagedContainer(namespace string, name StringOrNil, env map[string]string) {
	switch v := name.(type) {
	case string:
		fmt.Printf("Creating pod %s in namespace %s.\n", v, namespace)
		createPod(namespace, v, "postgres", env, []v1.ContainerPort{
			{
				ContainerPort: 5432,
			},
		})

		createService(namespace, v, 5432, v1.ServiceTypeNodePort)
	case nil:
		fmt.Printf("Creating default pod in namespace %s.\n", namespace)
		autoGeneratedName := uuid.NewString()
		createPod(namespace, autoGeneratedName, "postgres", env, []v1.ContainerPort{
			{
				ContainerPort: 5432,
			},
		})

		createService(namespace, autoGeneratedName, 5432, v1.ServiceTypeNodePort)
	default:
		fmt.Printf("Invalid name type: %T\n", v)
	}
}

func createManagedContainer(namespace string, name StringOrNil, env map[string]string) {
	switch v := name.(type) {
	case string:
		fmt.Printf("Creating deployment %s in namespace %s.\n", v, namespace)
		CreateDeployment(namespace, v, "postgres", 1, env)
		createService(namespace, v, 5432, v1.ServiceTypeNodePort)
	case nil:
		fmt.Printf("Creating default deployment in namespace %s.\n", namespace)
		autoGeneratedName := uuid.NewString()
		CreateDeployment(namespace, autoGeneratedName, "postgres", 1, env)
		createService(namespace, autoGeneratedName, 5432, v1.ServiceTypeNodePort)
	default:
		fmt.Printf("Invalid name type: %T\n", v)
	}
}

func main() {
	namespace := "default"
	// Uncomment the following line if you want to fetch and print all resources
	// if err := fetchAndPrintAllResources(namespace); err != nil {
	//  defaultHandleError(err)
	// }

	envVars := map[string]string{
		"POSTGRES_USER":     "postgres",
		"POSTGRES_PASSWORD": "kl4fr9fUDS",
		"POSTGRES_DB":       "postgres",
		"POSTGRES_HOST":     "my-release-postgresql",
		"POSTGRES_PORT":     "5432",
	}

	CreateUnmanagedContainer(namespace, "kuku2", envVars)
	// Example for creating a managed container
	// createManagedContainer(namespace, nil, envVars)
}
