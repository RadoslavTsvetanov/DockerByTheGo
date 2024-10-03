
import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)
from checkIfCallIsPermitted import check_if_syscall_is_permitted, Rule, satisfies_rule, MODIFICATOR_TYPES



def test_check_if_syscall_is_permitted():
    # Test ruleset as per the new config
    ruleset = {
    "rules": {
        "open": {
            r"/passwd": "not_allow",   # Block access to /passwd, no quotes are needed
            r"'./.*'": "allow"         # Allow access to anything in the current directory
        },
        "run_on_all_syscalls_regrdless_of_type": {
            r".*google\.com.*": "not_allow"  # Block anything that involves google.com
        },
        "write": {
            r".*": "not_allow",               # Disable all writing permissions
            r"'koko.txt',.*": "allow"         # Allow writing only to koko.txt
        }
    }
}

    # Test 1: Allowed open syscall in the current directory
    syscall1 = "open('./test.txt')"
    result1 = check_if_syscall_is_permitted(syscall1, ruleset["rules"])
    assert result1["shouldRun"] == True, "Test 1 Failed"

    # Test 2: Blocked open syscall to /passwd
    syscall2 = "open('/passwd')"
    result2 = check_if_syscall_is_permitted(syscall2, ruleset["rules"])
    assert result2["shouldRun"] == False, "Test 2 Failed"

    # Test 3: Blocked syscall involving google.com
    syscall3 = "curl('google.com')"
    result3 = check_if_syscall_is_permitted(syscall3, ruleset["rules"])
    assert result3["shouldRun"] == False, "Test 3 Failed"

    # Test 4: Blocked write syscall to any file except koko.txt
    syscall4 = "write('foo.txt', 'data')"
    result4 = check_if_syscall_is_permitted(syscall4, ruleset["rules"])
    assert result4["shouldRun"] == False, "Test 4 Failed"

    # Test 5: Allowed write syscall to koko.txt
    syscall5 = "write('koko.txt', 'data')"
    result5 = check_if_syscall_is_permitted(syscall5, ruleset["rules"])
    assert result5["shouldRun"] == True, "Test 5 Failed"

    print("All tests passed!")

test_check_if_syscall_is_permitted()
