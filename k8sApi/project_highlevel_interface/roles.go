package helper 
import (
	"context"
	"fmt"
	. "k8s/primitives"

	v1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func createProjectRole(permissionsSet []rbacv1.PolicyRule, namespace string, roleName string) error {
	clientset, err1 := GetK8sClient()
	DefaultHandleError(err1)
	sa := &v1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:      roleName,
			Namespace: namespace,
		},
		Secrets: []v1.ObjectReference{
			{
				Name: "test-secret", //TODO: potential bug since eveything uses the same secret, make better logic
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
		Rules: permissionsSet,
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
	_, err = clientset.RbacV1().RoleBindings(namespace).Create(context.Background(), roleBinding, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create role binding: %v", err)
	}

	secret := &v1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "my-service-account-token",
			Namespace: namespace,
			Annotations: map[string]string{
				"kubernetes.io/service-account.name": roleName,
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

func createAdminRole(name, projectName string) error {
	DefaultHandleError(createProjectRole([]rbacv1.PolicyRule{
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
	}, projectName, "admin"))

	return nil
}


// ! Logic for how requests will be sent to the cluster