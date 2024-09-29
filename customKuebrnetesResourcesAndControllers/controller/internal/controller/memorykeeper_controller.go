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

// dont touch the below comment
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
			// Retrieve usage values for CPU and memory
			cpuUsage := container.Usage.Cpu().MilliValue()  // CPU in millicores
			memoryUsage := container.Usage.Memory().Value() // Memory in bytes

			totalCPUUsage += cpuUsage
			totalMemoryUsage += memoryUsage
		}
	}

	return totalCPUUsage, totalMemoryUsage, nil
}

// getResourceQuota fetches the CPU and Memory resource quota for the namespace
func (r *MemoryKeeperReconciler) getResourceQuota(namespace string) (int64, int64, error) {
	resourceQuota := &corev1.ResourceQuota{}
	err := r.Client.Get(context.TODO(), client.ObjectKey{Name: "resource-quota", Namespace: namespace}, resourceQuota)
	if err != nil {
		return 0, 0, fmt.Errorf("error fetching ResourceQuota: %v", err)
	}

	cpuQuota := resourceQuota.Status.Hard[corev1.ResourceLimitsCPU].MilliValue()
	memoryQuota := resourceQuota.Status.Hard[corev1.ResourceLimitsMemory].Value()

	return cpuQuota, memoryQuota, nil
}

// getPodsOfImportance retrieves pods based on an importance level
func (r *MemoryKeeperReconciler) getPodsOfImportance(namespace string, importanceLevel int64) ([]corev1.Pod, error) {
	podList := &corev1.PodList{}
	listOpts := []client.ListOption{
		client.InNamespace(namespace),
		client.MatchingLabels{"importance": fmt.Sprintf("%d", importanceLevel)}, // Adjust label as needed
	}
	err := r.Client.List(context.TODO(), podList, listOpts...)
	if err != nil {
		return nil, fmt.Errorf("error listing pods: %v", err)
	}
	return podList.Items, nil
}

// getPodToDelete selects a pod to delete when resource usage exceeds the quota
func (r *MemoryKeeperReconciler) getPodToDelete(namespace string) (*corev1.Pod, error) {
	pods, err := r.getPodsOfImportance(namespace, 1) // Example importance level

	if err != nil {
		return nil, err
	}

	// Example: choose the first pod for deletion, modify logic as needed
	if len(pods) > 0 {
		return &pods[0], nil
	}

	return nil, fmt.Errorf("no pod found to delete")
}

// cleanResources checks resource consumption and deletes pods if usage exceeds the quota
func (r *MemoryKeeperReconciler) cleanResources(namespace string) error {
	totalCPUUsage, totalMemoryUsage, err := r.getNamespaceResourceConsumption(namespace)
	if err != nil {
		return err
	}

	cpuQuota, memoryQuota, err := r.getResourceQuota(namespace)
	if err != nil {
		return err
	}

	// If resource usage exceeds quota, delete a pod
	if totalCPUUsage > cpuQuota || totalMemoryUsage > memoryQuota {
		podToDelete, err := r.getPodToDelete(namespace)
		if err != nil {
			return err
		}
		err = r.Client.Delete(context.TODO(), podToDelete)
		if err != nil {
			return fmt.Errorf("error deleting pod: %v", err)
		}
	}

	return nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *MemoryKeeperReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1.MemoryKeeper{}).
		Complete(r)
}
