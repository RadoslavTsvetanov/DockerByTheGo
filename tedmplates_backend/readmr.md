# Design choives 

# S3 blobs with sql 

## since a template is a single entity and it does not need to exist seperately (except the metadata which is not needed for the k8s helper to work with )// refactor to be used seperately it is cheaper to store the big string in s3 and compress it and store just a link to the compressed s3 blob and decompress it during read request (for small numbers of requests it is cheaper but for large ones it is more expensive)


## TODO 

### Make a finding where you implement three strategies

#### First strategy is to store everything in sql e.g. the schema will look like 
```
{
    id
    metadata: {}
    template: whole_template
}
```
and no decompressing or blobing is made

#### Second strategy isuse blobing wothout decompressing and compressing


#### Third is with blobing and compressing


### now using the aws docs for pricing comapre the three strategies and see how they behave in these three enciroments

- low storage low requests when you have not much templates abd not much reading 
- low storage high requests when you have not much templates and but a lot of res 
- high storage low requests when you have a lot of templates buut not much reading
- high storage high requests when you have a lot of templates and a lot of reading