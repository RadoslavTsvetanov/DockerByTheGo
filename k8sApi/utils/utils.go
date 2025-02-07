package utils

import (
	"fmt"
	"os"

	rbacv1 "k8s.io/api/rbac/v1"
	"k8s.io/client-go/kubernetes"
)

func homeDir() string {
	if h := os.Getenv("HOME"); h != "" {
		return h
	}
	return os.Getenv("USERPROFILE") // Windows
}

func DefaultHandleError(e error) {
	if e != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", e)
	}
}

var AdminPolicyRule = []rbacv1.PolicyRule{
	{
		APIGroups: []string{"*"}, // Access to all API groups
		Resources: []string{"*"}, // Access to all resources
		Verbs:     []string{"*"}, // All verbs (create, delete, update, etc.)
	},
}

var clientset *kubernetes.Clientset
