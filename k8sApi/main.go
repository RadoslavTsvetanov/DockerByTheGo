package main

import (
	"context"
	"encoding/base64"
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

func createNamespaceAdminUser(name, namespace string) error {
	return createNamespaceProfile(name, namespace)
}

func createRole(roleName string, namespace string, permissions []rbacv1.PolicyRule) error {
	clientset, err := getK8sClient()
	defaultHandleError(err)
	role := &rbacv1.Role{
		ObjectMeta: metav1.ObjectMeta{
			Name:      roleName,
			Namespace: namespace,
		},
		Rules: permissions,
		// Create the ServiceAccount

	}
	_, err = clientset.RbacV1().Roles(namespace).Create(context.Background(), role, metav1.CreateOptions{})

	if err != nil {
		return fmt.Errorf("failed to create role binding: %v", err)
	}

	return nil
}

func createServiceAccount(name, roleName, namespace string) error {
	roleBinding := &rbacv1.RoleBinding{
		ObjectMeta: metav1.ObjectMeta{
			Name:      roleName,
			Namespace: namespace,
		},
		Subjects: []rbacv1.Subject{
			{
				Kind:      "ServiceAccount",
				Name:      roleName,
				Namespace: namespace,
			},
		},
		RoleRef: rbacv1.RoleRef{
			Kind:     "Role",
			Name:     "my-role",
			APIGroup: "rbac.authorization.k8s.io",
		},
	}

	_, err := clientset.RbacV1().RoleBindings(namespace).Create(context.Background(), roleBinding, metav1.CreateOptions{})
	secret := &v1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Annotations: map[string]string{
				"kubernetes.io/service-account.name": name,
			},
		},
		Type: "kubernetes.io/service-account-token",
	}

	_, err = clientset.CoreV1().Secrets(namespace).Create(context.Background(), secret, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create secret: %v", err)
	}

	clientset, err1 := getK8sClient()
	defaultHandleError(err1)
	sa := &v1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		},
		Secrets: []v1.ObjectReference{
			{
				Name: "test-secret",
			},
		},
	}
	_, err = clientset.CoreV1().ServiceAccounts(namespace).Create(context.Background(), sa, metav1.CreateOptions{})

	return err
}
func createNamespaceProfile(name, namespace string) error {
	clientset, err1 := getK8sClient()
	defaultHandleError(err1)
	sa := &v1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		},
		Secrets: []v1.ObjectReference{
			{
				Name: "test-secret",
			},
		},
	}
	_, err := clientset.CoreV1().ServiceAccounts(namespace).Create(context.Background(), sa, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create service account: %v", err)
	}

	// Create the Role
	role := &rbacv1.Role{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "my-role",
			Namespace: namespace,
		},
		Rules: []rbacv1.PolicyRule{
			{
				APIGroups: []string{"", "extensions", "apps"},
				Resources: []string{"*"},
				Verbs:     []string{"*"},
			},
			{
				APIGroups: []string{"batch"},
				Resources: []string{"jobs", "cronjobs"},
				Verbs:     []string{"*"},
			},
		},
	}
	_, err = clientset.RbacV1().Roles(namespace).Create(context.Background(), role, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create role: %v", err)
	}

	// Create the RoleBinding
	roleBinding := &rbacv1.RoleBinding{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "my-rolebinding",
			Namespace: namespace,
		},
		Subjects: []rbacv1.Subject{
			{
				Kind:      "ServiceAccount",
				Name:      name,
				Namespace: namespace,
			},
		},
		RoleRef: rbacv1.RoleRef{
			Kind:     "Role",
			Name:     "my-role",
			APIGroup: "rbac.authorization.k8s.io",
		},
	}
	_, err = clientset.RbacV1().RoleBindings(namespace).Create(context.Background(), roleBinding, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create role binding: %v", err)
	}

	// Create the Secret
	secret := &v1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "my-service-account-token",
			Namespace: namespace,
			Annotations: map[string]string{
				"kubernetes.io/service-account.name": name,
			},
		},
		Type: "kubernetes.io/service-account-token",
	}
	_, err = clientset.CoreV1().Secrets(namespace).Create(context.Background(), secret, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create secret: %v", err)
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

func getUserToken(namespace, secretName string) (string, error) {

	clientset, err := getK8sClient()
	secret, err := clientset.CoreV1().Secrets(namespace).Get(context.Background(), secretName, metav1.GetOptions{})

	if err != nil {
		return "", fmt.Errorf("failed to get secret: %v", err)
	}

	tokenData, ok := secret.Data["token"]
	if !ok {
		return "", fmt.Errorf("token not found in secret %s", secretName)
	}

	token := base64.StdEncoding.EncodeToString(tokenData)
	decodedToken, err := base64.StdEncoding.DecodeString(token)

	if err != nil {
		return "", fmt.Errorf("failed to decode token: %v", err)
	}

	return string(decodedToken), nil
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
	namespace := "testing-rbac-custom-roles"

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

	// err := createNamespace(namespace)
	// defaultHandleError(err)

	// queryAllResources(namespace)
	// defaultHandleError(createNamespaceRestrictedUser(namespace, "normal-user"))
	createNamespace(namespace)
	e := createRole("admin", namespace, []rbacv1.PolicyRule{
		{
			APIGroups: []string{"", "extensions", "apps"},
			Resources: []string{"*"},
			Verbs:     []string{"*"},
		},
		{
			APIGroups: []string{"batch"},
			Resources: []string{"jobs", "cronjobs"},
			Verbs:     []string{"*"},
		},
	})

	defaultHandleError(e)
	e = createServiceAccount("pesho", "admin", namespace)

	token, err := getUserToken(namespace, "pesho")
	fmt.Println(token)
	defaultHandleError(err)
}
func queryAllResources(namespace string) {
	clientset, err := getK8sClient()
	if err != nil {
		fmt.Printf("Error getting Kubernetes client: %v\n", err)
		return
	}

	fmt.Printf("Resources in namespace %s:\n", namespace)

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
