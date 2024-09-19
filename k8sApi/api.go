package main

import (
	"fmt"
)

func addUserToProject() {}

func createProject(projectName string, creatorName string) map[string]interface{} {
	createNamespace(projectName)
	adminroleName := "admin" // since evey project has roles we create a def admin one and assign it to the creator
	defaultHandleError(createRole(adminroleName, projectName, adminPolicyRule))
	defaultHandleError(createServiceAccount(creatorName, adminroleName, projectName))
	token, err := getUserToken(projectName, adminroleName)
	defaultHandleError(err)
	return map[string]interface{}{
		"token": token,
	}
}

func addNewRole(roleName string, permissionsObject map[string]string /*chnage type */) {}

func APIdeleteProject(projectName string) {
	deleteProject(projectName)
}

func createResource(dockerImg string, env map[string]string) {}

func exposeResource(resourceName string, hostName string) {}

func getProjectConnectInfo(projectName string, username string) {
	token, err := getUserToken(projectName, username)
	fmt.Println(token)
	defaultHandleError(err)

}
