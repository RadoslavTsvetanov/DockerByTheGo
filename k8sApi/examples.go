package main

// Note by project i mean a namespace

// this deploys a node js backend and a postgre db and wires them inside a certain project
const namespace = "ooo"

func wwwww() {

	// mysqlenvVars := map[string]string{
	// 	"MYSQL_ROOT_PASSWORD": "rootpassword", // Root password for the MySQL instance (required)
	// 	"MYSQL_DATABASE":      "mydatabase",   // Name of a database to create on startup (optional)
	// 	"MYSQL_USER":          "myuser",       // Non-root user to create (optional)
	// 	"MYSQL_PASSWORD":      "mypassword",   // Password for the non-root user (optional)
	// }

	postgreEnv := map[string]string{
		"POSTGRES_USER":     "postgres",
		"POSTGRES_PASSWORD": "kl4fr9fUDS",
		"POSTGRES_DB":       "postgres",
		"POSTGRES_HOST":     "my-release-postgresql",
		"POSTGRES_PORT":     "5432",
	}

	labels := map[string]string{ // note dont giove the same kabels to different services since there will be issues
		"hui": "",
	}

	createNamespace(namespace)

	// createManagedContainer(namespace, "nodenackend", postgreEnv, labels, "radoslav123/node-postgres-test", 3000)
	Postgre(namespace, "primary-db-v-2", postgreEnv, labels)
	// Mysql(namespace, "primary-db-mysql", mysqlenvVars, labels)

}

// this deletes a project
func fffff() {
	deleteProject(namespace)
}

// This deletes a certain service inside a project (it deletes the service, the deployment and the mesh node)
func gggg() {

}
