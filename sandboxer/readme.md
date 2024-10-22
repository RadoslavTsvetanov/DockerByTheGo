# Custom sandbox system

# Why

- i needed something lightweight since i am monitoring a single file/ process and its subprocesses and threads so i dont need to run full blown edr inside docker

- i needed something compatible with docker, due to the nature of docker to be lightweight, fast and compact most tools dont run splendidly         or at all in docker

- i needed something customazible but easy to write most edrs either provide either too robust (picture 1) way of writing rules or too inflexible since most provide a pseudo boolean language so i dcided its best to use regexing alongside this pseudo boolean dsl which is a widely adpoted dsl (the result i am trying to achieve is more or less the below picture which is the implementation in burp suite which i have enjoyed working with)

<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.matthewsetter.com%2Fimages%2Fposts%2Fburp-intercept-client-request.png&f=1&nofb=1&ipt=125d6ca56e02a0520fd7ef00281b4f41169d2e9a5e128521fa59d0f46f59459a&ipo=images"/> 

# How


# Design choices

## Why rust 

- its low level e.g. i can directly modify registers and is very importnat

- it is argueably the safest language on the low level space which is important when implementing something which we wouldnt want vulns in

- it is a modern language and it has way better developer experience


# Tech i took inspiration from
- burp suite for the custom pseudo boolean lang
- eBPF for the way to make a compact edr
- browsers vm implementations to see how to restrict code execution



# Future improvements 
- provide a scripting language alongside regexes by providing an easy interface so that people can run their scripts (will proably need to put certain limitations thou so thats why it is for the future)

    it will work in the following way -  like aws lambdas you need to define a function with a certain name which will be the entrypoint to the matcher abd this matcher will be provided an arg called syscallObj (more on the type in the code)
    
    Note: the lang wont be python but this is the best language to visualize what i want to do and for everyone to understand 
    ```python 

    class SyscallDebugObject:
    def __init__(self, signature: str, other_data: object):
        self.signature = signature # for example open("hui.out","rb"), write("foo.txt","buffer_example"), sockconnect("","") etc...;
        self.other_data = other_data # havent decided what to include yet but it will probably info simmilar to the one provided by strace linux cli util 

    def matcher(syscallObg: SyscallDebugObject) -> Boolean:
        # your magic in here
 

    ```
- use a model like aws policy evaluation logic however instead of explicit denies being the thing that takes presedence explicit allows will be like that since by default in our system everything is allowed by default 






# Examples
- in config.json you will see examples for each syscall going througgh all the ways you can make rules


```json 
// note comments are not allowed in json or atleast thats what vscode is teeling me


{
    "rules":
        {
            "open":{
                "('/passwd')":"not_allow", // like this we dont allow a certain path
                "('./*')":"allow" // like that we allow every file insside the current dir
            },
            "run_on_all_syscalls_regrdless_of_type":{
                "/(google.com)":"not_allow" // since we dont like google everything that contains google will be rejected 
            },
            "write":{
                "*":"not_allow", // we disable the write permission totally like that 
                "('koko.txt',*)":"allow" // siince this will be checked later it will over ride the previous rule and like that we have disabled all writing to files except to the `koko.txt`
            }
        }
    
}

```








# Pictures


- picture 1

    <img src="https://help.comodo.com/uploads/Comodo%20EDR/f5ac9acc337a0e8aea19781f31b0fad5/5eac818f1e1c4adc19d335055b06586b/2dcda2da0ce4e1b4c7de3d8a4a730964/edr_pol8.png"/>
