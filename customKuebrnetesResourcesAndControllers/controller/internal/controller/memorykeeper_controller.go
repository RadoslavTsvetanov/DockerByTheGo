/*
Copyright 2024.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controller

import (
	"context"
	"fmt"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	corev1 "controller/api/v1"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	metricsv1beta1 "k8s.io/metrics/pkg/client/clientset/versioned"
)

// MemoryKeeperReconciler reconciles a MemoryKeeper object
type MemoryKeeperReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=core.192.168.49.2,resources=memorykeepers,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core.192.168.49.2,resources=memorykeepers/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=core.192.168.49.2,resources=memorykeepers/finalizers,verbs=update

// Reconcile is part of the main Kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
func (r *MemoryKeeperReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := log.FromContext(ctx)

	// Fetch the MemoryKeeper instance
	memoryKeeper := &corev1.MemoryKeeper{}
	err := r.Get(ctx, req.NamespacedName, memoryKeeper)
	if err != nil {
		logger.Error(err, "Failed to fetch MemoryKeeper")
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// Fetch the namespace resource consumption
	totalCPUUsage, totalMemoryUsage, err := r.getNamespaceResourceConsumption(req.Namespace)
	if err != nil {
		logger.Error(err, "Failed to fetch resource consumption")
		return ctrl.Result{}, err
	}

	// Log resource consumption
	logger.Info(fmt.Sprintf("Total CPU Usage: %dm, Total Memory Usage: %dMi", totalCPUUsage, totalMemoryUsage/(1024*1024)))

	// TODO: Apply your custom logic based on resource consumption here
	// E.g., update the status of the MemoryKeeper based on the usage
	// r.updateMemoryKeeperStatus(memoryKeeper, totalCPUUsage, totalMemoryUsage)

	return ctrl.Result{}, nil
}

// getNamespaceResourceConsumption fetches resource consumption for the namespace
func (r *MemoryKeeperReconciler) getNamespaceResourceConsumption(namespace string) (int64, int64, error) {
	// Get the existing config from the controller-runtime
	config := ctrl.GetConfigOrDie()

	// Create metrics clientset using the controller-runtime's config
	metricsClientset, err := metricsv1beta1.NewForConfig(config)
	if err != nil {
		return 0, 0, fmt.Errorf("error creating Metrics clientset: %v", err)
	}

	// Get all Pods in the namespace
	podMetricsList, err := metricsClientset.MetricsV1beta1().PodMetricses(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return 0, 0, fmt.Errorf("error fetching pod metrics in namespace %s: %v", namespace, err)
	}

	// Initialize total CPU and memory usage counters
	var totalCPUUsage, totalMemoryUsage int64

	// Iterate over pod metrics and collect their usage
	for _, podMetrics := range podMetricsList.Items {
		for _, container := range podMetrics.Containers {

			cpuUsage := container.Usage
			memoryUsage := container.Usage
			fmt.Println(cpuUsage, memoryUsage)
			totalCPUUsage += 0    // in millicores
			totalMemoryUsage += 0 // in bytes
		}
	}

	return totalCPUUsage, totalMemoryUsage, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *MemoryKeeperReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1.MemoryKeeper{}).
		Complete(r)
}

// func getPodsOfPriority(r *MemoryKeeperReconciler, podImportanceName string, namespace string) ([]corev1.Pod, error) {
// 	// Step 1: Get the PodImportance resource
// 	podImportance := &examplev1.PodImportance{}
// 	err := r.Client.Get(context.TODO(), client.ObjectKey{
// 		Name:      podImportanceName,
// 		Namespace: namespace,
// 	}, podImportance)
// 	if err != nil {
// 		return nil, err
// 	}

// 	// Step 2: Build the label selector from the PodImportance spec
// 	selector, err := metav1.LabelSelectorAsSelector(&metav1.LabelSelector{
// 		MatchLabels: podImportance.Spec.Selector.MatchLabels,
// 	})
// 	if err != nil {
// 		return nil, err
// 	}

// 	// Step 3: List pods matching the label selector in the specified namespace
// 	podList := &corev1.PodList{}
// 	listOpts := []client.ListOption{
// 		client.InNamespace(namespace),
// 		client.MatchingLabelsSelector{Selector: selector},
// 	}
// 	err = r.Client.List(context.TODO(), podList, listOpts...)
// 	if err != nil {
// 		return nil, err
// 	}

// 	// Step 4: Filter pods based on the importance level if needed
// 	var filteredPods []corev1.Pod
// 	for _, pod := range podList.Items {
// 		if podImportance.Spec.ImportanceLevel == 8 { // Replace 8 with the dynamic value if needed
// 			filteredPods = append(filteredPods, pod)
// 		}
// 	}

// 	return filteredPods, nil
// }

func getPodsOfPriority(r *MemoryKeeperReconciler, priorityNumber int) ([]pods, error) {

	r.Client.List()
	for pod := range pods {

	}

}
