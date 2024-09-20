- platform where you can easily deploy your docker containers
- to deploy a docker container you create a `project` 
- in a project you can create container and choose from a variety of container `options`
- to deploy a container you just have to specify a docker img from the docker repository
- some `options` include:
	- expose -> gives it a publicly accessible url to ssh into or if its some kind of server to expose it to the internet
	- deplyment_type:
		- self managed (if it stops it stops)
		- managed ( it gets restarted and sends you a notificagtion with info about the crash )
- also you can give `tags` to your containers so that you can easily query them 
- roles:
	- by default you are assigned an admin role 
	- you can create roles and assign them to other people which you invite (where that will be useful? -> lets say ypu have an issue and you ask  random person on the internet to help you, you wouldnt want to trust them so you justassign them read privileges)
  - also each `role` needs permissions to function, a `permission` is a single unit of rights which gives access to a given action (e.g.  read, write ( you can only add not remove ), invite, delete).
    For example the admin role hasa the following permissions:
    ```

    {
      
      write: true,
      delete: true,
      invite: true,
      canSnapshot: true,
      
    }

    ```

- **Volume Management**: Provide persistent storage options that can be attached to containers, enabling stateful services and data persistence.
- also each `project` dashboard has a `metrics` tab where you can see all kinds of useful info 
- also if you need two containers to communicate you dont need to expose two containers to internet but instead access them within the same project network 
- also you can easily `stop` containers or projects and delete them or `suspend` them so that you can easily get them back up while paying only for storage and not for compute  
- also the api is exposed publicly for each user e.g. a user can control their resources programatically where he just needs an api key genersted from options 
- also since a lot of web dev things are redundant you can specify templates in which you configure most settings and leave a few of them blank -> an example where it would be useful is deploying a backend connecting to a db and a backup service accessing the db. Here is an example: (keep in mind there are some globally provided variables like the network which you canalso specify) 
```
  {
  "project": {
    "name": "example_project",
    "description": "An example project template"
  },
  "containers": [
    {
      "name": "backend_service",
      "image": "example/backend:latest",
      "environment": {
        "DB_HOST": "$db_host",
        "DB_PORT": "$db_port",
        "DB_USER": "$db_user",
        "DB_PASSWORD": "$db_password"
      },
      "options": {
        "expose": true,
        "tags": ["backend", "service"]
      }
    },
    {
      "name": "database",
      "image": "example/database:latest",
      "environment": {
        "POSTGRES_USER": "$db_user",
        "POSTGRES_PASSWORD": "$db_password"
      },
      "options": {
        "expose": false,
        "tags": ["database", "postgres"]
      }
    },
    {
      "name": "backup_service",
      "image": "example/backup:latest",
      "environment": {
        "DB_HOST": "$db_host",
        "DB_PORT": "$db_port",
        "DB_USER": "$db_user",
        "DB_PASSWORD": "$db_password"
      },
      "options": {
        "expose": false,
        "tags": ["backup", "service"]
      }
    }
  ],
  "variables": {
    "db_host": "database",
    "db_port": "5432",
    "db_user": "example_user",
    "db_password": "example_password"
  },
  "network": {
    "name": "example_network",
    "driver": "bridge"
  }
}

```


- **Built-in Monitoring and Alerts**: with managed services if a service goes down it automatically goes up again but it also sets up an alert to a `source`. Sources can be custom but also there are built in ones with email and discord using bot 

- **Detailed Metrics**: Offer detailed metrics and monitoring tools to track the performance and health of containers and projects.
- **Alerting**: Allow users to set up alerts for issues such as crashes or performance degradation, possibly integrating with third-party services like Slack or email. ( make it into an event driven system where alongisde the container you deploy a listener which listens for certain things like restarting etc ... or make it useing logs collector)

**Automatic TLS/SSL Management**:

- Integrate with a certificate authority (e.g., Let's Encrypt) to automatically generate and renew TLS/SSL certificates.
- Provide users with the option to enable HTTPS for their services effortlessly.

- infra as diagram and code: the project has a `/infra` which exposes a diagram from which you can make quick edits to services in  the form of a diagram
- rawdog friendly, you just want the k8s cluster set up with all the additional helpers? - sure you  can configure your kubectl and rawdog it 
