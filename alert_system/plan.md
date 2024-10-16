It will be of two steps:

1. queue which accepts alerts where an alert type is 
 ```
{
    channelId,
    message
}
```

2. backend which consumes the queue msgs