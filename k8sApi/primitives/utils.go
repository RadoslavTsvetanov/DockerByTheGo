package primitives

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	rbacv1 "k8s.io/api/rbac/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
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

func GetK8sClient() (*kubernetes.Clientset, error) {
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
