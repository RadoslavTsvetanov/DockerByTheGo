import json
import re
from enum import Enum

################################################################
#
# Classes and Types

class RULE_TYPES(Enum):
    REGEX = "REGEX"
    CUSTOM = "CUSTOM"

class MODIFICATOR_TYPES(Enum):
    ALLOW = "allow"
    NOT_ALLOW = "not_allow"

class Rule:
    def __init__(self, content: str, modificator: MODIFICATOR_TYPES) -> None:
        self.content = content
        self.modificator = modificator

################################################################
#
# Core Logic

def to_bool(val):
    if val == None:
        return False
    else:
        return True

def satisfies_rule(rule_content: str, syscall: str):
    content_inside_parens = re.search(r'\((.*?)\)', syscall) # e.g. from open("fiel.txt","rb") we get `"file.txt","rb",""`
    
    if not content_inside_parens:
        raise Exception("no content inside parentheses")
    
    content_of_syscall = content_inside_parens.group(1)
    
    res = re.search(rule_content, content_of_syscall);

    return to_bool(res) 

def check_if_syscall_is_permitted(syscall: str, ruleset: dict):
    syscall_name = syscall.split('(')[0]
    print(f"Checking syscall: {syscall_name}")

    return_object = {"shouldRun": True}
    
    # Check for general rules that apply to all syscalls
    general_rules = ruleset.get("run_on_all_syscalls_regrdless_of_type", {})
    for rule_content, modificator_str in general_rules.items():
        modificator = MODIFICATOR_TYPES(modificator_str)
        
        if modificator == MODIFICATOR_TYPES.ALLOW and satisfies_rule(rule_content,syscall):
            return_object["shouldRun"] = True
            print("entering allow")
        elif modificator == MODIFICATOR_TYPES.NOT_ALLOW and satisfies_rule(rule_content, syscall):
            return_object["shouldRun"] = False
            print("entering not")
            print("args",rule_content,syscall)

        # if not satisfies_rule(rule_content, modificator, syscall):
            # return_object["shouldRun"] = False
    print (syscall,return_object["shouldRun"])
    syscall_rules = ruleset.get(syscall_name, {})
    for rule_content, modificator_str in syscall_rules.items():
        modificator = MODIFICATOR_TYPES(modificator_str)
        # TODO: refactor the below code to eliminate code duplication with the above checks
        if modificator == MODIFICATOR_TYPES.ALLOW and satisfies_rule(rule_content,  syscall):
            return_object["shouldRun"] = True
        elif modificator == MODIFICATOR_TYPES.NOT_ALLOW and satisfies_rule(rule_content, syscall):
            return_object["shouldRun"] = False
        
    print("end of check -----")
    return return_object
