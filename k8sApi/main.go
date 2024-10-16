package main

import (
	"fmt"
	. "k8s/primitives"
	. "k8s/templates"
)

var namespace = "ooo"

func testApplyingTemplateContainerWithNormalValues() {

	tc := TemplateContainer{
		ImageName: "nginx",
		Name:      "nginx-container",
		Exposure:  Exposure{Type: Exposed},
		Env: map[string]string{
			"FOO": "bar",
		},
		Mode: Managed,
		Metadata: TemplateMetadata{
			Author:      "John Doe",
			Version:     "1.0.0",
			Description: "Nginx web server container",
		},
		Labels: map[string]string{
			"app": "nginx",
		},
		Port: 80,
	}

	err := ApplyTemplateToProject(namespace, []TemplateContainer{tc})
	if err != nil {
		fmt.Println(err)
	}

}

func main() {

	// namespace := "testing-rbac-custom-roles"

	fmt.Print(GetServicesFromOutsideTheCluster(namespace))

	// testApplyingTemplateContainerWithNormalValues()

	// envVars := map[string]string{
	// 	"POSTGRES_USER":     "postgres",
	// 	"POSTGRES_PASSWORD": "kl4fr9fUDS",
	// 	"POSTGRES_DB":       "postgres",
	// 	"POSTGRES_HOST":     "my-release-postgresql",
	// 	"POSTGRES_PORT":     "5432",
	// }
	// labels := map[string]string{
	// 	"app": "example-app",
	// 	"env": "development",
	// }

	// err := CreateNamespace(namespace)
	// DefaultHandleError(err)

	// queryAllResources(namespace)
	// DefaultHandleError(CreateNamespaceRestrictedUser(namespace, "normal-user"))
	// CreateNamespace(namespace)
	// e := CreateRole("admin", namespace, []rbacv1.PolicyRule{
	// 	{
	// 		APIGroups: []string{"", "extensions", "apps"},
	// 		Resources: []string{"*"},
	// 		Verbs:     []string{"*"},
	// 	},
	// 	{
	// 		APIGroups: []string{"batch"},
	// 		Resources: []string{"jobs", "cronjobs"},
	// 		Verbs:     []string{"*"},
	// 	},
	// })

	// DefaultHandleError(e)
	// e = CreateServiceAccount("pesho", "admin", namespace)

	// token, err := GetUserToken(namespace, "pesho")
	// fmt.Println(token)
	// DefaultHandleError(err)

	// fmt.Println(createProject("huihuiov", "huiyo"))

	// wwwww()

	// fffff()

	// exposeService()

	// gettingEndpointsInAProjectForOutsideProjectAccess()

	// just_for_testing_workload_operator()

}
