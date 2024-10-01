import json
import re
# since the real implementation wont be in python cuz its not a suitable lang for this i will use it for quick protopying and so i wont be using seperate files 


################################################################
#
# classes and types
class SyscallDebugObject:
    def __init__(self, signature: str, other_data: object):
        self.signature = signature # for example open("hui.out","rb"), write("foo.txt","buffer_example"), sockconnect("","") etc...;
        self.other_data = other_data # havent decided what to include yet but it will probably info simmilar to the one provided by strace linux cli util 

type RULE_TYPES = {


    "REGEX",
    "CUSTOM"
}

type MODIFICATOR_TYPES = {
    "allow",
    "not_allow"
}

class Regex:
    def __init__(self, regex: str, rule: MODIFICATOR_TYPES) -> None:
        self.regex = regex
        self.rule = rule

class Rule:
    def __init__(self, type: RULE_TYPES, content: str, modificator: MODIFICATOR_TYPES) -> None:
        self.type = type
        self.content = content
        self.modificator = modificator

# 
#
#
#######################################

################################################################
#
# utils needed but not core logic
def load_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

#
#
###########################################################

def satisfies_rule(rule: Rule, syscall):
    
    if(rule.type == RULE_TYPES.REGEX):
        content_of_syscall_inside_the_braces = rule.content[rule.content.find("(")-1:len(rule.content)]
        if rule.modificator == "allow":
            return bool(re.match(content_of_syscall_inside_the_braces, syscall))
        elif rule.modificator == "not_allow":
            return not bool(re.match(content_of_syscall_inside_the_braces, syscall))
    else:
        return eval("rule.content({syscall})") # something like that i guess

def check_if_syscall_is_permitted(syscall:str):
    
    syscalls_rules = load_json_file("./config.json")["rules"]
    
    syscall_name =   syscall[0:syscall.find("(")]
    print(syscall_name)
    return_object = {
        "shouldRun": True
    }
    for rule in syscalls_rules:
    
        return_object["shouldRun"] = satisfies_rule(rule, syscall)
            

check_if_syscall_is_permitted("open()")