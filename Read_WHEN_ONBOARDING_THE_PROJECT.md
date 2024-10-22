# WHY READ THIS

I created this file to list things for each subproject since some of the things can become quite difficult and you will probably encounter the same issues as me if you just read the get started guide if the tool


# Content 

## K8S operators

- core apis: by default even if you specify the --kind to be `Deployment` kubebuilder will create a CRD instead of operating with the default deployment ,thats why if you are creating an api for already existing resource i reccomend taking a look at this first: `https://master.book.kubebuilder.io/reference/using_an_external_resource` even thou it says external types it also covers core types
- when you need more permissionsfor your controller dont add them to the rbac but instead add them to the comments above the reconcile function which look like `//+kubebuilder .......`
