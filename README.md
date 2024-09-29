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

# Built in tools:

When setting up the cluster for your happy k8s existence we set up some things for you. Some of the tools and operators are:

- operator which manages your resources consumption so that you dont go over the limit of your tier 

- **Built-in Monitoring and Alerts**: with managed services if a service goes down it automatically goes up again but it also sets up an alert to a `source`.

- service mesh

- **Detailed Metrics**: Offer detailed metrics and monitoring tools to track the performance and health of containers and projects. The metrics are exposed on a port and also the pod which is responsible for that does not go in the resource quota so dont bother removing it

- **Alerting**: Allow users to set up alerts for issues such as crashes or performance degradation, possibly integrating with third-party services like Slack or email. ( make it into an event driven system where alongisde the container you deploy a listener which listens for certain things like restarting etc ... or make it useing logs collector). By default there are three alert streams: slack, discord bot and email, but users can define custom alert handlers in the following langs: [js, python and bash]. Each project has an alerts tab where you can see all your custom handlers and the url for your alerts. why a url? - well to be able to send alerts and handle them using different handlers there is an alert collector in which every alert is stored, from there there are consumers for each alert according to the channel id. by using this approach we ensure that alerts are being handled in the orrder they are submitted (not that we dont take in mind the time overhead introduced by your custom handlers). Note custom handlers are excuted inside ephemeral pods to prevent maliicious activity so there are some limitations opposed on you as a handler write, look at custom handler enviremonts for more info

# Custom Handler Enviroments:
Each channel jobs run inside a pod so no channel has access to the reources of other channel, this way we allow you to have modify the enviroment while protecting you from others channels
each time a handler is updated the pod is cleaned up
these pods have resource limitations which unless you have something very complex you probably wont exceed them but if exceeded you need to pay extra for bigger ceilling 

# Automatic TLS/SSL Management:

- Integrate with a certificate authority (e.g., Let's Encrypt) to automatically generate and renew TLS/SSL certificates.

- Provide users with the option to enable HTTPS for their services effortlessly.

- infra as diagram and code: the project has a `/infra` which exposes a diagram from which you can make quick edits to services in  the form of a diagram

- rawdog friendly, you just want the k8s cluster set up with all the additional helpers? - sure you  can configure your kubectl and rawdog it 







# Resource consumption throttling
Our goal is to simplify the usage of the cloud while at the same tyme not setting up traps like the big clouds so there are two policies we implment for resource consumption


- strict: if your project happens to exceed the quotas you have your container that takes the most will be killed (note you can set up importance levels to containers so that the least important containers are killed first) and it repeats this until its back within range. You will be notofied for each killing of course and the  reason will be code 707 (see our custom status codes for more info) 

- soft: if your project happens to exceed the limit you start paying as you go according to a standard quota ( or upgrade to the next plan i will decide ), you will ofc recieve an alert but no service will be killed, unless you upgrade your plan when you go backto the quota you will again be charged according to the plan you are on 







# Custom status codes
We believe in giving info whenever we do something which you did not request explicitely ( for example killing a service since it exceeded the quota) so we use status codes in our messages, here you can find info abiut them:
- 707: quota exceeded, this indicates that the reason for the performed action is that the service has exceeded the memeory qoutas, scenarios where you will encounter this are but not all -> killing, increase quota for the resource



