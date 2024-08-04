package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	appsv1 "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

var clientset *kubernetes.Clientset
var namesapce_based_role = "koko"

func createNamespaceRestrictedUser(namespace, roleName string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return fmt.Errorf("failed to get Kubernetes client: %v", err)
	}

	ctx := context.TODO()

	// Create ServiceAccount
	sa := &v1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:      roleName,
			Namespace: namespace,
		},
	}

	_, err = clientset.CoreV1().ServiceAccounts(namespace).Create(ctx, sa, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create service account: %v", err)
	}

	// Create Role
	role := &rbacv1.Role{
		ObjectMeta: metav1.ObjectMeta{
			Name:      roleName,
			Namespace: namespace,
		},
		Rules: []rbacv1.PolicyRule{
			{
				APIGroups: []string{""},
				Resources: []string{"pods", "services", "configmaps", "secrets"},
				Verbs:     []string{"get", "list", "watch", "create", "update", "delete"},
			},
			{
				APIGroups: []string{"apps"},
				Resources: []string{"deployments", "replicasets", "statefulsets"},
				Verbs:     []string{"get", "list", "watch", "create", "update", "delete"},
			},
			{
				APIGroups: []string{"batch"},
				Resources: []string{"jobs", "cronjobs"},
				Verbs:     []string{"get", "list", "watch", "create", "update", "delete"},
			},
		},
	}

	_, err = clientset.RbacV1().Roles(namespace).Create(ctx, role, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create role: %v", err)
	}

	// Create RoleBinding
	roleBinding := &rbacv1.RoleBinding{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "namespace-restricted-rolebinding",
			Namespace: namespace,
		},
		Subjects: []rbacv1.Subject{
			{
				Kind:      rbacv1.ServiceAccountKind,
				Name:      "example-service-account",
				Namespace: namespace,
			},
		},
		RoleRef: rbacv1.RoleRef{
			Kind:     "Role",
			Name:     roleName,
			APIGroup: "rbac.authorization.k8s.io",
		},
	}

	_, err = clientset.RbacV1().RoleBindings(namespace).Create(ctx, roleBinding, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create role binding: %v", err)
	}

	return nil
}

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

func createPod(namespace, name, image string, envVars map[string]string, containerPorts []v1.ContainerPort, labels map[string]string) error {
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
			Labels: labels,
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
			ServiceAccountName: namesapce_based_role, // kinda lazy refactor later, gosh if this was ts i could create a class called user and attach all the redunadant args to the constructor
		},
	}
	_, err = clientset.CoreV1().Pods(namespace).Create(context.Background(), pod, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("Pod %s created successfully in namespace %s.\n", name, namespace)
	return nil
}

func createService(namespace, name string, port int32, serviceType v1.ServiceType, labels map[string]string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	service := &v1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:   name,
			Labels: labels,
		},
		Spec: v1.ServiceSpec{
			Selector: labels,
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

func CreateDeployment(namespace, name, image string, replicas int32, env map[string]string, labels map[string]string) error {
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
			Name:   name,
			Labels: labels,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			Template: v1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
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

func CreateUnmanagedContainer(namespace string, name StringOrNil, env map[string]string, labels map[string]string, containerImageName string) {
	switch nameThatForSureIsString := name.(type) {
	case string:
		fmt.Printf("Creating pod %s in namespace %s.\n", nameThatForSureIsString, namespace)
		createPod(namespace, nameThatForSureIsString, "postgres", env, []v1.ContainerPort{
			{
				ContainerPort: 5432,
			},
		}, labels)

		createService(namespace, nameThatForSureIsString, 5432, v1.ServiceTypeNodePort, labels)
	case nil:
		fmt.Printf("Creating default pod in namespace %s.\n", namespace)
		autoGeneratedName := uuid.NewString()
		createPod(namespace, autoGeneratedName, "postgres", env, []v1.ContainerPort{
			{
				ContainerPort: 5432,
			},
		}, labels)

		createService(namespace, autoGeneratedName, 5432, v1.ServiceTypeNodePort, labels)
	default:
		fmt.Printf("Invalid name type: %T\n", nameThatForSureIsString)
	}
}

func createManagedContainer(namespace string, name StringOrNil, env map[string]string, labels map[string]string, imageName string) {
	switch v := name.(type) {
	case string:
		fmt.Printf("Creating deployment %s in namespace %s.\n", v, namespace)
		CreateDeployment(namespace, v, imageName, 1, env, labels)
		createService(namespace, v, 5432, v1.ServiceTypeNodePort, labels)
	case nil:
		fmt.Printf("Creating default deployment in namespace %s.\n", namespace)
		autoGeneratedName := uuid.NewString()
		CreateDeployment(namespace, autoGeneratedName, imageName, 1, env, labels)
		createService(namespace, autoGeneratedName, 5432, v1.ServiceTypeNodePort, labels)
	default:
		fmt.Printf("Invalid name type: %T\n", v)
	}
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

func DeployBackend(namespace string, imageName string, envVars map[string]string, labels map[string]string) { // just giving a better name
	CreateUnmanagedContainer(namespace, imageName, envVars, labels, imageName)
}

func main() {
	namespace := "test-db-3"

	// envVars := map[string]string{
	// 	"POSTGRES_USER":     "postgres",
	// 	"POSTGRES_PASSWORD": "kl4fr9fUDS",
	// 	"POSTGRES_DB":       "postgres",
	// 	"POSTGRES_HOST":     "my-release-postgresql",
	// 	"POSTGRES_PORT":     "5432",
	// }
	// labels := map[string]string{
	// 	"app": "example-app",
	// 	"env": "development",
	// }

	err := createNamespace(namespace)
	defaultHandleError(err)

	queryAllResources(namespace)
	defaultHandleError(createNamespaceRestrictedUser(namespace, "normal-user"))

}
func queryAllResources(namespace string) {
	clientset, err := getK8sClient()
	if err != nil {
		fmt.Printf("Error getting Kubernetes client: %v\n", err)
		return
	}

	fmt.Printf("Resources in namespace %s:\n", namespace)

	// List Pods
	pods, err := clientset.CoreV1().Pods(namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		fmt.Printf("Error listing pods: %v\n", err)
		return
	}
	fmt.Printf("Pods:\n")
	for _, pod := range pods.Items {
		data, err := json.Marshal(pod)
		if err != nil {
			fmt.Printf("Error marshalling pod: %v\n", err)
			continue
		}
		fmt.Printf("---\n%s\n", string((data)))
	}

	// List Services
	services, err := clientset.CoreV1().Services(namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		fmt.Printf("Error listing services: %v\n", err)
		return
	}
	fmt.Printf("Services:\n")
	for _, service := range services.Items {
		data, err := json.Marshal(service)
		if err != nil {
			fmt.Printf("Error marshalling service: %v\n", err)
			continue
		}
		fmt.Printf("---\n%s\n", string(data))
	}

	// List Deployments
	deployments, err := clientset.AppsV1().Deployments(namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		fmt.Printf("Error listing deployments: %v\n", err)
		return
	}
	fmt.Printf("Deployments:\n")
	for _, deployment := range deployments.Items {
		data, err := json.Marshal(deployment)
		if err != nil {
			fmt.Printf("Error marshalling deployment: %v\n", err)
			continue
		}
		fmt.Printf("---\n%s\n", string(data))
	}
}

// DBs

func Postgre(namespace string, name string, env map[string]string, labels map[string]string) {
	createManagedContainer(namespace, name, env, labels, "postgres")
}

func Mysql(namespace string, name string, env map[string]string, labels map[string]string) {
	createManagedContainer(namespace, name, env, labels, "mysql")
}

func Mongo(namespace string, name string, env map[string]string, labels map[string]string) {
	createManagedContainer(namespace, name, env, labels, "mongo")
}

func Redis(namespace string, name string, env map[string]string, labels map[string]string) {
	createManagedContainer(namespace, name, env, labels, "redis")
}
