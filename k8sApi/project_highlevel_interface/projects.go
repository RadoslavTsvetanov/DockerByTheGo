package helper

import (
	. "k8s/utils"

	rbacv1 "k8s.io/api/rbac/v1"
)

func CreateProject(projectName string, creatorName string) map[string]interface{} {
	CreateNamespace(projectName)
	adminroleName := "admin" // default admin role
	DefaultHandleError(CreateRole(adminroleName, projectName, AdminPolicyRule))
	DefaultHandleError(CreateServiceAccount(creatorName, adminroleName, projectName))
	token, err := GetUserToken(projectName, adminroleName)
	DefaultHandleError(err)

	return map[string]interface{}{
		"token": token,
	}
}

func setUpProject(name string) {
	DefaultHandleError(CreateNamespace(name))
	CreateRole("admin", "name", []rbacv1.PolicyRule{
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
	})
}

func DeleteProject(namespace string) {
	client, err := GetK8sClient()
	DefaultHandleError(err)
	// Delete the namespace itself
	DeleteNamespace(client, namespace)
}
