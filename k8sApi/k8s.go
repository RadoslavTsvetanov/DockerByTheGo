package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"

	corev1 "k8s.io/api/core/v1"

	appsv1 "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
)

var namesapce_based_role = "koko"

// Function to delete a Kubernetes resource based on its name and type
func deleteResource(resourceType, name, namespace string) error {
	clientset, err := getK8sClient()
	defaultHandleError(err)
	switch resourceType {
	case "pod":
		return clientset.CoreV1().Pods(namespace).Delete(context.TODO(), name, metav1.DeleteOptions{})
	case "service":
		return clientset.CoreV1().Services(namespace).Delete(context.TODO(), name, metav1.DeleteOptions{})
	case "deployment":
		return clientset.AppsV1().Deployments(namespace).Delete(context.TODO(), name, metav1.DeleteOptions{})
	// Add more resource types as needed
	default:
		return fmt.Errorf("unsupported resource type: %s", resourceType)
	}
}

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

func getNodePort() (int32, error) {

	clientset, err := getK8sClient()

	services, err := clientset.CoreV1().Services(corev1.NamespaceAll).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return 0, fmt.Errorf("failed to list services: %v", err)
	}

	usedPorts := make(map[int32]struct{})
	for _, svc := range services.Items {
		for _, port := range svc.Spec.Ports {
			if port.NodePort != 0 {
				usedPorts[port.NodePort] = struct{}{}
			}
		}
	}

	// Iterate through the NodePort range and find an available port
	for port := int32(30000); port <= 32767; port++ {
		if _, exists := usedPorts[port]; !exists {
			return port, nil
		}
	}
	return 0, err
}

func sanitizeLabels(labels map[string]string) {

	for key, value := range labels {
		labels[key] = sanitizeInput(value)
	}

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

func createService(namespace, name string, port int32, serviceType v1.ServiceType, projectNameSelector map[string]string) error {
	clientset, err := getK8sClient()
	if err != nil {
		return err
	}

	service := &v1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
		Spec: v1.ServiceSpec{
			Selector: projectNameSelector,
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

func createDefaultLabels(namespace, name, image string) map[string]string {
	labels := map[string]string{
		"app":       name,      // Label representing the app name
		"namespace": namespace, // Label representing the namespace
		"version":   "v1",      // A default version label
		"image":     image,     // Optional: Label for the image being used
	}

	return labels
}

// Note: Since k9s is too pecky about names this fnction wioll server to sanitize the strings passed to k8s
func sanitizeInput(input string) string {
	input = strings.ToLower(input)

	// Replace invalid characters with hyphens
	re := regexp.MustCompile(`[^a-z0-9\-]`)
	sanitized := re.ReplaceAllString(input, "-")

	// Trim leading and trailing hyphens
	sanitized = strings.Trim(sanitized, "-")

	// Limit length to 63 characters since this is the max amount of chard available in k8s
	if len(sanitized) > 63 {
		sanitized = sanitized[:63]
	}

	return sanitized

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
func DeployBackend(namespace string, imageName string, envVars map[string]string, labels map[string]string) { // just giving a better name
	CreateUnmanagedContainer(namespace, imageName, envVars, labels, imageName, 0000)
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

func setUpMonitoring(namespace string) {

}

func deleteNamespace(clientset *kubernetes.Clientset, namespace string) {
	err := clientset.CoreV1().Namespaces().Delete(context.TODO(), namespace, metav1.DeleteOptions{})
	if err != nil {
		fmt.Printf("Failed to delete namespace %s: %v\n", namespace, err)
	} else {
		fmt.Printf("Successfully deleted namespace %s\n", namespace)
	}
}

func createAlertPod() {}
