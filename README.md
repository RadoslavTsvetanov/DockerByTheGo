f# Overview of the project

build an aws amplify on top of this and make a fully lambda next js deployment Template, add sst like code as infra tool



- platform where you can easily deploy all kinds of `application`s which work on the base of docker container  
- to deploy an `application` you create a `project` 
- in a `project` you can create `application` and choose from a variety of `application` `options`
- to deploy an application  you just have to specify a docker img from the docker repository or  a custom registry but additional set up is required so you will need to do these [steps] (#cuatom-id)
- some `options` include:
	- expose -> gives it a publicly accessible url to ssh into or if its some kind of db to expose it to the internet
	- deplyment_type:
		- self managed (if it stops it stops)
		- managed ( it gets restarted and sends you a notification with info about the crash )
- also you can give `tags` to your `application`s so that you can easily query them 
- **Volume Management**: Provide persistent storage options that can be attached to containers, enabling stateful services and data persistence. ( abstraction over persistent volume claims)
- also each `project` dashboard has a `metrics` tab where you can see all kinds of useful info. The `metrics` for a cluster also expose a public api so that any `application` or `buddy` can push metrics to it (this is achieved by using a combination of kibana and elastic and grafana)
- also if you need two containers to communicate you dont need to expose two containers to internet but instead access them within the same project network 
- also you can easily `stop` containers or projects and delete them or `suspend` them so that you can easily get them back up while paying only for storage and not for compute  
- also the api is exposed publicly for each user e.g. a user can control their resources programatically where he just needs an api key genersted from options which is just the user role token which is in your browser ( this token is different from auth token foe the ebsite, since by default all your user keys are stored in the browser for each role you have signed up with /* more detailed explanation in rbac */)

# Templates 
- also since a lot of web dev things are redundant (for example spining up a postgre db) you can specify or browse templates in which you configure most settings and leave a few of them blank -> an example where it would be useful is deploying a backend connecting to a db and a backup service accessing the db. Here is an example: (keep in mind there are some globally provided variables like the network which you canalso specify) 
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


## Built in tools when using our cloud solution (note you can install them yourself too but here they are preconfigured):

When setting up the cluster for your happy k8s existence we set up some things for you. Some of the tools and operators are:

- operator which manages your resources consumption so that you dont go over the limit of your tier 

- **Built-in Monitoring and Alerts**: with managed services if a service goes down it automatically goes up again but it also sets up an alert to a `source`.

- service mesh

- **Detailed Metrics**: Offer detailed metrics and monitoring tools to track the performance and health of containers and projects. The metrics are exposed on a port and also the pod which is responsible for that does not go in the resource quota so dont bother removing it

- **Alerting**: Allow users to set up alerts for issues such as crashes or performance degradation, possibly integrating with third-party services like Slack or email. ( make it into an event driven system where alongisde the container you deploy a listener which listens for certain things like restarting etc ... or make it useing logs collector). By default there are three alert streams: slack, discord bot and email, but users can define custom alert handlers in the following langs: [js, python and bash]. Each project has an alerts tab where you can see all your custom handlers and the url for your alerts. why a url? - well to be able to send alerts and handle them using different handlers there is an alert collector in which every alert is stored, from there there are consumers for each alert according to the channel id. by using this approach we ensure that alerts are being handled in the orrder they are submitted (not that we dont take in mind the time overhead introduced by your custom handlers). Note custom handlers are excuted inside ephemeral pods to prevent maliicious activity so there are some limitations opposed on you as a handler write, look at custom handler enviremonts for more info

## Custom Handler Enviroments:
Each `channel job` run inside a pod so no channel has access to the reources of other channel, this way we allow you to have modify the enviroment while protecting you from others channels
each time a handler is updated the pod is cleaned up
these pods have resource limitations which unless you have something very complex you probably wont exceed them but if exceeded you need to pay extra for bigger ceilling 

## Automatic TLS/SSL Management:

- Integrate with a certificate authority (e.g., Let's Encrypt) to automatically generate and renew TLS/SSL certificates.

- Provide users with the option to enable HTTPS for their services effortlessly.

- infra as diagram and code: the project has a `/infra` which exposes a diagram from which you can make quick edits to services in  the form of a diagram

- rawdog friendly, you just want the k8s cluster set up with all the additional helpers? - sure you  can configure your kubectl and rawdog it 




## Container scout
- it goes through all your projects and checks if any services of yours are vulnerable to known cve\`s, exploits, etc ... and if it is found it fires an `alert` 


## Resource consumption throttling
Our goal is to simplify the usage of the cloud while at the same tyme not setting up traps like the big clouds so there are two policies we implment for resource consumption


- strict: if your project happens to exceed the quotas you have your container that takes the most will be killed (note you can set up importance levels to containers so that the least important containers are killed first) and it repeats this until its back within range. You will be notofied for each killing of course and the  reason will be code 707 (see our custom status codes for more info) 

- soft: if your project happens to exceed the limit you start paying as you go according to a standard quota ( or upgrade to the next plan i will decide ), you will ofc recieve an alert but no service will be killed, unless you upgrade your plan when you go backto the quota you will again be charged according to the plan you are on 


## History
- every action you perform against the cluster is saved in a history (for now only all helper actions are saved e.g. if you modify the cluster usibng kubectl it wont be displayed)
- audit logs but better (we just dispkay audit logs better)


## Buddies
- a buddy is an application which extends your current one, fo example dashboard logging etc ..., they can be set both at the `service` level or at the `deployment` level since behind the scenes we as running k8s. They are kinda like coolify services

## Rollbacks

you can take a `snapshot` of your project and  if you change your project and something goes wrokg you can quickly restore the previous state of the project


## Integrated ai helper (propritieary, only availab;e on the platoform) 

- you can opt out of it 

- it is being fed data from your config and so you can ask it questions about your project

## Decalaritive First
- by def since it is using k8s it is theoretically declarative but we have introduced an abstraction layer above that makes your whole project a template which you can view and export at any time



## Some other helpers we have introduced

### kill rules manager
#### Since the rules for killing pods in k8s is pretty basic we introduce a better way to manage pods 
- importance level, this is a resource which you attach to a deployment which specifies how important this process is, why is that helpful? lets say your cluster is out of memory so it starts killing pods, you have no guarantee that the db will be killed which is way worse than just killing one replica of a pod, with our system the thing woth lower priority is killed first, also we provide a web interface to this service which you can accesss from within the cluster in which you can define custom rules what happens when the cluster is out of resources and you can disable this (implementation detail this should also be implemented as custo rule it will just be built in)

## Custom status codes
We believe in giving info whenever we do something which you did not request explicitely ( for example killing a service since it exceeded the quota) so we use status codes in our messages, here you can find info abiut them:
- 707: quota exceeded, this indicates that the reason for the performed action is that the service has exceeded the memeory qoutas, scenarios where you will encounter this are but not all -> killing, increase quota for the resource

# Design choices

## Why kafka instead of rabbitmq for alert collector:
- it provides two ways to scale of needed making it more flexible
- it allows two or more consumers two use a queue independently of each other
- rabbitmq is a "simple" queue abstracted with a web interface
-  kafka combines a publish subsribe and queue model and i needed the functionality for different services to consume the same topic while both needing the topics seperate e.g. consuming a record with one service shouldnrt remove it for the other so like that i can quickly scale up and down the services seperately
  ```
    Website Activity Tracking
    The original use case for Kafka was to be able to rebuild a user activity tracking pipeline as a set of real-time publish-subscribe feeds. This means site activity (page views, searches, or other actions users may take) is published to central topics with one topic per activity type. These feeds are available for subscription for a range of use cases including real-time processing, real-time monitoring, and loading into Hadoop or offline data warehousing systems for offline processing and reporting.

    Activity tracking is often very high volume as many activity messages are generated for each user page view. 
  ```
there could be huge amoubnts of alerts which need to be scaled programatically in case of an alert outbreak and i need different consumers to consume the same queue independently

## Why custom way to run handlers over lambda lets say:
- no persstent storage: with lambda leaving a trace on the ysytem i difficlu and needs to be managed externally, also it provides a lot of limitationstht a custom laert sytem would need
- security: lambdas can easilt be exploited to run a lot of times and i wont have such fine control over it as a k8s pod worker

## Why custom sandbox solution
- i needed something lightweight since i am monitoring a single file/ process and its subprocesses and threads so i dont need to run full blown edr inside docker
- i needed something compatible with docker, due to the nature of docker to be lightweight, fast and compact most tools dont run splendidly         or at all in docker
- i needed something customazible but easy to write most edrs either provide either too robust (picture 1) way of writing rules or too inflexible since most provide a pseudo boolean language so i dcided its best to use regexing alongside this pseudo boolean dsl which is a widely adpoted dsl (the result i am trying to achieve is more or less the below picture which is the implementation in burp suite which i have enjoyed working with)
<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.matthewsetter.com%2Fimages%2Fposts%2Fburp-intercept-client-request.png&f=1&nofb=1&ipt=125d6ca56e02a0520fd7ef00281b4f41169d2e9a5e128521fa59d0f46f59459a&ipo=images"/> 
Note there is a readme in the sandboxer which is more detailed
- why rust: itss low level and provides access to the libc and diret ptrace, ok but why nit c ? - it is old, type not safe (major red flag for building a sandboxer); the rust compiler is a lot more strict and provides out of bound checks, also i needed somthing performant and as fast as possible (rust matches c in terms of performance)
## Why golang for the k8sApi heler
- go-client is the defacto package with the most adoption and support
- i was looking for new language after ts fatigue

## Some diagrams to visualize better the architecture
- the alert system: `https://excalidraw.com/#json=TMBT6N24qs6WeQIVBWR2f,iMq1KeAnZfNalI6IxXL3og`

# Why choose this tool:
## we are both aws and vercel
- want to rawdog you project using just the kubectl? - you can do it on our platofrm
- you want highly abstracted vercel aqpproach? - you can achieve it using our tool or use existing projects config. We just provide you with tools and guard rails for you if you want to use them
- no third party if you want, all of these helpers are deployed locally e.g. the data you pass through it does not go through our servers, we just provide the helpers. Note there are some services like some alerts (for example default email alerts and discird) which do go through our servers but you can also run them locally preconfigured (this introdcues additional billing) to your cluster. Bassically what i mean is that all helpers we provide that makes your life easier also have alternatives which are deployed locally to your cluster instead of going through a centralized server (which for some is security  concern) (TODO : make all preconfigured hek=lpers to be able to be deployed into the cluster and not be centralized). For example the email service is either hosted by us and you use it for free (at the cost of us potentially using this data) or you deploy it locally in the cluster but you will need to pay extra for this running (note: when running your clusters in our custom platfrm some helpers are free of charge - to know whether one is free or not yo just check the docs for the services under `DOCS`)
- ease of use while using your own infra, most if not all easy to use platforms are highly abstracted closed source providers, we chnage that by making our tool to just need a vps or a cluster and the tool spin ups a local gui which you can access to use the same ui we have in our frontend (although support for it might lack version updating, also running this gui will increase the resource consumtion since you are running it locally, just like portainer)

# Adding a custom registry {#custom-id}
- in `project settings` click on `add new container registry`

# Vendor independent
## If you want to use other provider you can set up a k8s cluster there and manage all you projects there the tool will still work as expected exc3ept for some vendor sepcific things which where possible we will document in the `other providers` section. The benefits of using our platform is first (the tool always works ax expected without problems) adn second we provide some helpers which we cant possibly do with other vendors (currently none)


# RBAC 

## Roles:
- when you are creating a project by default the creator is assigned an admin role 
- you can create roles and assign them to other people which you invite (where that will be useful? -> lets say ypu have an issue and you ask  random person on the internet to help you, you wouldnt want to trust them so you just assign them read privileges, note we rate limit read only requests since they dont requi)
- There are two ways clients can use roles
  - assign them to a user that way whenever an authnticated request is fired against the project the permissions are hecked
  - create a key which is associated with a token (behind the scenes you just assign it to a user which is created dynamically and when the token expires it is removed dynamically, this could be changed later ) 
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


# Getting started
## there are 3 ways to get started
- use our platform with a managed cluster from us (not much set up needed on your behalf)
- install our docker container on the machine your kubectl is (why not inside the cluster? - since it is still an application it could increase the k8s clustwr resource consumption), note when spinning it up no matter what access you havev to a cluster all actions will show and if you have insufficient permissions you will recieve unauthenticated error
- inside the cluster (very easy set up but will take somw of the resources of the cluster)

# Forum

## we would like to centralize the place where problems and solutions for our project are so we have a forum with intuitive design like `stackoverflow`

## why use the forum

- you help us make the project better by sending the issues directly to us. Although github issues is the place for bugs its not where all bugs should be (for example buggy frontend) 

- you help us make our ai better, we gather training data for our model from the questions in the forum and it is with the added benefit is
 that it will be trained better than the normal chatbots since we are using the same open source model but with more carefully picked data
# DOCS

## Getting started

### Installation

The installation happens by deploying a pod (or deployment) insde your cluster, here is an example pod which installs the tool 
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app-container
        image: nginx  # Replace with your app image
        ports:
        - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  type: NodePort  # Or LoadBalancer, if on cloud provider
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080  # NodePort range is 30000-32767 # to access it from outside the cluster

```

Also for your ease of use the is a publically exposed api so that the community can develop frontend for the tool but we also made our own which is again a docker img amd you just need to configure a connection url which will use to talkk with the tool server. It can really be run everywhere a docker continaer can be run (or if you have npm installed) so you can decide of you want to deplopy it in the cluster or in a remote machine.





# How does our platform for the tool work for you paranoid guys that want to know how everything works so we will save you some digging

## Projects and spaces
- a `project` is a k8s namespace and a `space` is a seperate cluster, hence why you can reference `application`s between projects in the same `space`






- each group is an eks behind the scenes and each project is a k8s namespace

# Other services
## github on push rebuild server
## wasm lambdas


# Dump, dont read this
there are two ways to authenticate, one is to treat the frontend as a client which detects your kubeconfig service account key and sends it with every request and the handler on apihelper does the rest, the other is to spin up a local db inthe cluster alongside the client.go and use stabdard way of auth where users send tokens which they got from username and password like in standard web app
