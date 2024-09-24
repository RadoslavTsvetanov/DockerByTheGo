// this file will provide autoceomplete and intellisense for selecting resources
// This file provides auto-complete and intellisense for selecting resources.
package main

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// getServicesFromInsideTheCluster returns a list of service endpoints from the source namespace.
func getServicesFromInsideTheCluster(targetNamespace string, sourceNamespace string) ([]string, error) {
	client, err := getK8sClient()
	defaultHandleError(err)

	services, err := client.CoreV1().Services(sourceNamespace).List(context.TODO(), metav1.ListOptions{})
	defaultHandleError(err)

	var serviceEndpoints []string

	for _, service := range services.Items {
		serviceEndpoint := service.Name

		if sourceNamespace != targetNamespace {

			serviceEndpoint += "." + sourceNamespace + ".svc.cluster.local"

		}

		serviceEndpoints = append(serviceEndpoints, serviceEndpoint)
	}

	return serviceEndpoints, nil
}

// ServiceExternalEndpoints defines the structure for external service endpoints.
type ServiceExternalEndpoints struct {
	ExternalIPs   []string
	ExternalPorts []int
}

// getServicesFromOutsideTheCluster returns external endpoints for services in the specified namespace.
func getServicesFromOutsideTheCluster(namespace string) ([]ServiceExternalEndpoints, error) {
	clientset, err := getK8sClient()
	defaultHandleError(err)

	var serviceEndpoints []ServiceExternalEndpoints

	services, err := clientset.CoreV1().Services(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	for _, service := range services.Items {
		var externalIPs []string
		for _, ip := range service.Spec.ExternalIPs {
			externalIPs = append(externalIPs, ip)
		}

		var externalPorts []int
		for _, port := range service.Spec.Ports {
			externalPorts = append(externalPorts, int(port.NodePort)) // Convert to int if needed
		}

		serviceEndpoints = append(serviceEndpoints, ServiceExternalEndpoints{
			ExternalIPs:   externalIPs,
			ExternalPorts: externalPorts,
		})
	}

	return serviceEndpoints, nil

}
