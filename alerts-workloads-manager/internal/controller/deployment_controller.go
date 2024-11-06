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
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// DeploymentReconciler reconciles a Deployment object
type DeploymentReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=apps.example.com,resources=deployments,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=apps.example.com,resources=deployments/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=apps.example.com,resources=deployments/finalizers,verbs=update
// +kubebuilder:rbac:groups=*,resources=*,verbs=*

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Deployment object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.19.0/pkg/reconcile

func (r *DeploymentReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	// Fetch all Deployments with label "alert-workload"
	deploymentList := &appsv1.DeploymentList{}
	labelSelector := client.MatchingLabels{"alert-workload": "true"}
	err := r.Client.List(ctx, deploymentList, labelSelector)
	if err != nil {
		fmt.Println(err, "unable to list Deployments with label alert-workload")
		return ctrl.Result{}, err
	}

	for _, deployment := range deploymentList.Items {
		// Get resource consumption from the deployment's pods
		cpuUsage, memoryUsage, err := GetDeploymentResourceConsumption(ctx, r.Client, &deployment)
		if err != nil {
			fmt.Println(err, "unable to fetch resource consumption", "deployment", deployment.Name)
			continue // Skip to the next deployment
		}

		// Log the resource limits for visibility
		fmt.Println("resource consumption", deployment.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU], deployment.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceMemory])

		// Calculate usage percentages based on requests and limits
		cpuUsagePercentage := 0    //(cpuUsage / float64(deployment.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU].MilliValue())) * 100
		memoryUsagePercentage := 0 // (memoryUsage / float64(deployment.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceMemory].Value())) * 100
		fmt.Println("resources:", cpuUsage, ";", memoryUsage, ";", deployment.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU], ";", deployment.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceMemory])
		fmt.Println("Resource consumption", "deployment", deployment.Name, "CPU usage", cpuUsagePercentage, "Memory usage", memoryUsagePercentage)

		// Scale up or down based on resource consumption thresholds
		if cpuUsagePercentage > 85 || memoryUsagePercentage > 85 {
			err := IncreaseDeployment(ctx, r.Client, &deployment)
			if err != nil {
				fmt.Println(err, "unable to increase deployment replicas", "deployment", deployment.Name)
			}
		} else if cpuUsagePercentage < 35 && memoryUsagePercentage < 35 {
			err := DecreaseDeployment(ctx, r.Client, &deployment)
			if err != nil {
				fmt.Println(err, "unable to decrease deployment replicas", "deployment", deployment.Name)
			}
		}
	}


	return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *DeploymentReconciler) SetupWithManager(mgr ctrl.Manager) error {
	fmt.Println("huiuhhuhuhihuihuihuihuihihuihuiuhuhuihu")
	return ctrl.NewControllerManagedBy(mgr).For(&appsv1.DaemonSet{}).
		// Uncomment the following line adding a pointer to an instance of the controlled resource as an argument
		// For().
		Complete(r)
}
