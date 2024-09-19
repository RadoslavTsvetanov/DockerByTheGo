package main

// this deploys a node js backend and a postgre db and wires them

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
	labels := map[string]string{
		"connect": "connect",
	}

	namespace := "ooo"
	createNamespace(namespace)
	createManagedContainer(namespace, "nodenackend", nil, labels, "radoslav123/node-postgres-test", 3000)
	deleteResource("deployment", "primary-db", namespace)
	Postgre(namespace, "primary-db", postgreEnv, labels)
	// Mysql(namespace, "primary-db-mysql", mysqlenvVars, labels)

}
