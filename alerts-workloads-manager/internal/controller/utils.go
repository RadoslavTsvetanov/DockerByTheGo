// controller/utils.go
package controller

import (
	"context"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/labels"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// QueryAllPods retrieves all pods with the label "workload-runner".
func QueryAllPods(ctx context.Context, cli client.Client) ([]corev1.Pod, error) {
	podList := &corev1.PodList{}
	err := cli.List(ctx, podList, &client.ListOptions{
		LabelSelector: labels.SelectorFromSet(map[string]string{"workload-runner": "true"}),
	})
	if err != nil {
		return nil, err
	}
	return podList.Items, nil
}

// GetDeploymentResourceConsumption fetches all pods from a deployment and returns their resource consumption.
func GetDeploymentResourceConsumption(ctx context.Context, cli client.Client, deployment *appsv1.Deployment) (float64, float64, error) {
	pods := &corev1.PodList{}
	err := cli.List(ctx, pods, &client.ListOptions{
		LabelSelector: labels.SelectorFromSet(deployment.Spec.Selector.MatchLabels),
		Namespace:     deployment.Namespace,
	})
	if err != nil {
		return 0, 0, err
	}

	var totalCPU, totalMemory int64
	for _, pod := range pods.Items {
		if pod.Status.Phase != corev1.PodRunning {
			continue // Skip non-running pods
		}
		for _, container := range pod.Spec.Containers {
			// Sum up CPU and Memory requests
			if container.Resources.Requests != nil {
				if cpu, ok := container.Resources.Requests[corev1.ResourceCPU]; ok {
					totalCPU += cpu.MilliValue()
				}
				if memory, ok := container.Resources.Requests[corev1.ResourceMemory]; ok {
					totalMemory += memory.Value()
				}
			}
		}
	}

	// Return CPU and Memory in milliunits and bytes respectively
	return float64(totalCPU), float64(totalMemory), nil
}

// IncreaseDeployment increases the replicas of the given deployment by one.
func IncreaseDeployment(ctx context.Context, cli client.Client, deployment *appsv1.Deployment) error {
	deployment.Spec.Replicas = int32Ptr(*deployment.Spec.Replicas + 1)
	return cli.Update(ctx, deployment)
}

// DecreaseDeployment decreases the replicas of the given deployment by one, ensuring it doesn't go below 1.
func DecreaseDeployment(ctx context.Context, cli client.Client, deployment *appsv1.Deployment) error {
	if *deployment.Spec.Replicas > 1 {
		deployment.Spec.Replicas = int32Ptr(*deployment.Spec.Replicas - 1)
		return cli.Update(ctx, deployment)
	}
	return nil
}

// Helper function to convert int to *int32
func int32Ptr(i int32) *int32 {
	return &i
}
