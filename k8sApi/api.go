package main

import (
	"fmt"
)

func addUserToProject()

func createProject()

func addNewRole(roleName string, permissionsObject map[string]string /*chnage type */) {}

func APIdeleteProject() {}

func createResource(dockerImg string, env map[string]string) {}

func exposeResource(resourceName string, hostName string) {}

func getProjectConnectInfo(projectName string, username string) {
	token, err := getUserToken(projectName, username)
	fmt.Println(token)
	defaultHandleError(err)

}
