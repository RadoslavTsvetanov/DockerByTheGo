package main

import (
	"fmt"
	. "k8s/primitives"
	. "k8s/templates"
)

var namespace = "alerts-workloads-manager-system"

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

func testingSpinningUpMiniInfra() {

	tc1 := TemplateContainer{
		ImageName: "postgres",
		Name:      "my-postgres",
		Exposure:  Exposure{Type: Internal},
		Env: map[string]string{
			"POSTGRES_USER":     "postgres",
			"POSTGRES_PASSWORD": "kl4fr9fUDS",
			"POSTGRES_DB":       "postgres",
			"POSTGRES_HOST":     "my-release-postgresql",
			"POSTGRES_PORT":     "5432",
		},
		Mode: Unmanaged,
		Metadata: TemplateMetadata{
			Author:      "John Doe",
			Version:     "1.0.0",
			Description: "PostgreSQL database container",
		},
		Labels: map[string]string{
			"app": "back-up-db",
		},
		Port: 5432,
	}

	tc2 := TemplateContainer{
		ImageName: "radoslav123/temp-temp:latest",
		Name:      "my-server",
		Exposure:  Exposure{Type: Exposed},
		Env: map[string]string{
			"PG_HOST":     "primary-db-v-2",
			"PG_PORT":     "5432",
			"PG_USER":     "postgres",
			"PG_PASSWORD": "kl4fr9fUDS",
			"PG_DATABASE": "postgres",
		},
		Mode: Managed,
		Metadata: TemplateMetadata{
			Author:      "John Doe",
			Version:     "1.0.0",
			Description: "Node.js server container",
		},
		Labels: map[string]string{
			"app": "server",
		},
		Port: 3000,
	}

	ApplyTemplateToProject("ooo", []TemplateContainer{tc1, tc2})

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

	fmt.Print("")

	GetServicesFromOutsideTheCluster("ooo")
testApplyingTemplateContainerWithNormalValues()
	// testingSpinningUpMiniInfra()

}
