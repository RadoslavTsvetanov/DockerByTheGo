
import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)
from checkIfCallIsPermitted import check_if_syscall_is_permitted, Rule, satisfies_rule, MODIFICATOR_TYPES


def test_satisfies_rule():
    # Test 1: ALLOW a matching regex
    rule1 = Rule(r'file\.txt', MODIFICATOR_TYPES.ALLOW)
    syscall1 = "open('file.txt', 'rb')"
    res = satisfies_rule(rule1.content, syscall1)
    print(res)
    assert res  == True, "Test 1 Failed"


    # Test 3: ALLOW for non-matching regex
    rule3 = Rule(r'foo\.txt', MODIFICATOR_TYPES.ALLOW)
    syscall3 = "open('bar.txt', 'rb')"
    assert satisfies_rule(rule3.content, syscall3) == False, "Test 3 Failed"

    print("All tests passed!")

test_satisfies_rule()
