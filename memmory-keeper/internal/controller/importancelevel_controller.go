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
	customv1 "memory-keeper/api/v1"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// ImportanceLevelReconciler reconciles a ImportanceLevel object
type ImportanceLevelReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// the first one is for dev env 
// +kubebuilder:rbac:groups="*",resources="*",verbs="*"
// +kubebuilder:rbac:groups=custom.my.domain,resources=importancelevels,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=custom.my.domain,resources=importancelevels/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=custom.my.domain,resources=importancelevels/finalizers,verbs=update
// +kubebuilder:rbac:groups=*,resources=*,verbs=*

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the ImportanceLevel object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.19.0/pkg/reconcile

func getPodResourceUsage(pod corev1.Pod) (int64, int64, error) {
	cpuUsage := int64(0)
	memoryUsage := int64(0)

	for _, container := range pod.Spec.Containers {
		cpuUsage += container.Resources.Requests.Cpu().Value()
		memoryUsage += container.Resources.Requests.Memory().Value()
	}

	return cpuUsage, memoryUsage, nil
}

func (r *ImportanceLevelReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	podList := &corev1.PodList{}
	if err := r.Client.List(ctx, podList, &client.ListOptions{}); err != nil {
		fmt.Println("Failed to list pods:", err)
		return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
	}

	// Print resource consumption for each pod
	for _, pod := range podList.Items {
		podName := pod.Name
		namespace := pod.Namespace
		cpuUsage, memoryUsage, err := getPodResourceUsage(pod)
		if err != nil {
			fmt.Println("Failed to get resource usage for pod", podName, "in namespace", namespace, ":", err)
			continue
		}
		fmt.Println("Resource consumption for pod", podName, "in namespace", namespace, " - CPU:", cpuUsage, "Memory:", memoryUsage)
	}

	// Requeue after 30 seconds
	return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *ImportanceLevelReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&customv1.ImportanceLevel{}).
		Complete(r)
}
