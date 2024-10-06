use std::collections::HashMap;
mod filter;
use crate::filter::{check_if_syscall_is_permitted,satisfies_rule,ModificatorType, Rule};

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {

    use super::*;


    #[test]
    fn test_satisfies_rule() {
        // Test 1: ALLOW a matching regex
        let rule1 = Rule {
            content: String::from(r"file\.txt"),
            modificator: ModificatorType::Allow,
        };
        let syscall1 = "open('file.txt', 'rb')";
        let res = satisfies_rule(&rule1.content, syscall1);
        println!("{}", res);
        assert!(res, "Test 1 Failed");

        // Test 3: ALLOW for non-matching regex
        let rule3 = Rule {
            content: String::from(r"foo\.txt"),
            modificator: ModificatorType::Allow,
        };
        let syscall3 = "open('bar.txt', 'rb')";
        assert!(!satisfies_rule(&rule3.content, syscall3), "Test 3 Failed");

        println!("All tests passed!");
    }

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }

    fn prepopulate_ruleset() -> HashMap<String, HashMap<String, String>>{
                let mut ruleset: HashMap<String, HashMap<String, String>> = HashMap::new();

        let mut open_rules: HashMap<String, String> = HashMap::new();
        open_rules.insert(String::from(r"/passwd"), String::from("not_allow"));  // Block access to /passwd
        open_rules.insert(String::from(r"'./.*'"), String::from("allow"));       // Allow access to anything in the current directory
        ruleset.insert(String::from("open"), open_rules);

        let mut general_rules: HashMap<String, String> = HashMap::new();
        general_rules.insert(String::from(r".*google\.com.*"), String::from("not_allow"));  // Block anything involving google.com
        ruleset.insert(String::from("run_on_all_syscalls_regrdless_of_type"), general_rules);

        let mut write_rules: HashMap<String, String> = HashMap::new();
        write_rules.insert(String::from(r".*"), String::from("not_allow"));               // Disable all writing permissions
        write_rules.insert(String::from(r"'koko.txt',.*"), String::from("allow"));        // Allow writing only to koko.txt
        ruleset.insert(String::from("write"), write_rules);

        return ruleset;
    }


    #[test]
    fn test_check_if_syscall_is_permitted() {
        // Test ruleset as per the new config
        let ruleset = prepopulate_ruleset();

        // Test 1: Allowed open syscall in the current directory
        let syscall1 = "open('./test.txt')";
        let result1 = check_if_syscall_is_permitted(syscall1, &ruleset);
        assert_eq!(result1.get("shouldRun").unwrap(), &true, "Test 1 Failed");

        // Test 2: Blocked open syscall to /passwd
        let syscall2 = "open('/passwd')";
        let result2 = check_if_syscall_is_permitted(syscall2, &ruleset);
        assert_eq!(result2.get("shouldRun").unwrap(), &false, "Test 2 Failed");

        // Test 3: Blocked syscall involving google.com
        let syscall3 = "curl('google.com')";
        let result3 = check_if_syscall_is_permitted(syscall3, &ruleset);
        assert_eq!(result3.get("shouldRun").unwrap(), &false, "Test 3 Failed");

        // Test 4: Blocked write syscall to any file except koko.txt
        let syscall4 = "write('foo.txt', 'data')";
        let result4 = check_if_syscall_is_permitted(syscall4, &ruleset);
        assert_eq!(result4.get("shouldRun").unwrap(), &false, "Test 4 Failed");

        // Test 5: Allowed write syscall to koko.txt
        let syscall5 = "write('koko.txt', 'data')";
        let result5 = check_if_syscall_is_permitted(syscall5, &ruleset);
        assert_eq!(result5.get("shouldRun").unwrap(), &true, "Test 5 Failed");

        println!("All tests passed!");
    }
}
