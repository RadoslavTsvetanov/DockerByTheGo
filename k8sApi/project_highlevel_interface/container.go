package helper

import (
	"context"
	"fmt"
	"k8s/primitives"
	. "k8s/primitives"

	"github.com/google/uuid"
	corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func CreateUnmanagedContainer(namespace string, name StringOrNil, env map[string]string, labels map[string]string, containerImageName string, port int) {
	switch nameThatForSureIsString := name.(type) {
	case string:
		fmt.Printf("Creating pod %s in namespace %s.\n", nameThatForSureIsString, namespace)
		CreatePod(namespace, nameThatForSureIsString, "postgres", env, []v1.ContainerPort{
			{
				ContainerPort: int32(port),
			},
		}, labels)

		CreateService(namespace, nameThatForSureIsString, int32(port), v1.ServiceTypeNodePort, labels)
	case nil:
		fmt.Printf("Creating default pod in namespace %s.\n", namespace)
		autoGeneratedName := uuid.NewString()
		CreatePod(namespace, autoGeneratedName, "postgres", env, []v1.ContainerPort{
			{
				ContainerPort: int32(port),
			},
		}, labels)

		CreateService(namespace, autoGeneratedName, int32(port), v1.ServiceTypeNodePort, labels)
	default:
		fmt.Printf("Invalid name type: %T\n", nameThatForSureIsString)
	}
}

func CreateManagedContainer(namespace string, containerName primitives.StringOrNil, env map[string]string, labels map[string]string, imageName string, port int) {

	// Create projectName env variable based on name
	var projectName string
	if strName, ok := containerName.(string); ok {
		projectName = strName
		fmt.Printf("Creating deployment %s in namespace %s.\n", projectName, namespace)
	} else {
		fmt.Printf("Creating default deployment in namespace %s.\n", namespace)
		projectName = uuid.NewString() // Auto-generate name if name is nil
	}

	projectSelector := map[string]string{
		"projectname": projectName,
	}

	// Add projectName to env and labels
	labels["projectname"] = projectName

	env["projectName"] = projectName

	// Create deployment and service
	err := CreateDeployment(namespace, projectName, imageName, 1, env, labels)
	DefaultHandleError(err)
	CreateService(namespace, projectName, int32(port), v1.ServiceTypeNodePort, projectSelector)
}

func exposeContainer(containerName string, projectName string) error {
	clientset, err := GetK8sClient()
	if err != nil {
		return fmt.Errorf("failed to get Kubernetes client: %v", err)
	}

	// Get the service associated with the container
	service, err := clientset.CoreV1().Services(projectName).Get(context.TODO(), containerName, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("failed to get service: %v", err)
	}

	// Check if the service is already of type NodePort
	if service.Spec.Type == corev1.ServiceTypeNodePort {
		fmt.Println("The specified service is already of type NodePort.")
		return nil
	}

	// Find an available NodePort
	nodePort, err := GetNodePort()
	if err != nil {
		return err
	}

	// Fetch the old port from the existing service
	if len(service.Spec.Ports) == 0 {
		return fmt.Errorf("service has no ports defined")
	}
	oldPort := service.Spec.Ports[0].Port

	// Update the service to add NodePort
	service.Spec.Type = corev1.ServiceTypeNodePort

	// Update the service ports
	service.Spec.Ports[0] = corev1.ServicePort{
		Port:       oldPort,                      // Keep the existing port
		TargetPort: intstr.FromInt(int(oldPort)), // Update target port
		NodePort:   nodePort,                     // Assign the new NodePort
	}

	// Update the service in Kubernetes
	_, err = clientset.CoreV1().Services(projectName).Update(context.TODO(), service, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("failed to update service: %v", err)
	}

	fmt.Printf("NodePort %d added successfully to service %s.\n", nodePort, containerName)

	return nil
}

func unxeposeContainer(containerName string, namespace string) error {
	clientset, err := GetK8sClient()
	fmt.Print("lool")
	service, err := clientset.CoreV1().Services(namespace).Get(context.TODO(), containerName, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("failed to get service: %v", err)
	}

	if service.Spec.Type == corev1.ServiceTypeNodePort {

		// Remove NodePort by changing the service type to ClusterIP or another type
		service.Spec.Type = corev1.ServiceTypeClusterIP
		// Update the servic``
		_, err = clientset.CoreV1().Services(namespace).Update(context.TODO(), service, metav1.UpdateOptions{})
		if err != nil {
			return fmt.Errorf("failed to update service: %v", err)
		}
		fmt.Println("NodePort removed successfully.")
	} else {
		fmt.Println("The specified service is not of type NodePort.")
	}

	return nil
}