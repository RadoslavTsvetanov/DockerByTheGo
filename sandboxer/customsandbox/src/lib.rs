#![allow(warnings)]
mod filter;
use crate::filter::{is_syscall_permittedd,satisfies_rule,ModificatorType};
use std::collections::HashMap;
pub mod types;
mod constants;
mod utils;

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use serde_json::json;
    use types::{JsonConfigType, SyscallRuleSet};

    use super::*;


    #[test]
    fn test_satisfies_rule() {
        
        
        // Test 1: ALLOW a matching regex
        let syscall1 = "open('file.txt', 'rb')";
        let res = satisfies_rule(&String::from(r"file\.txt"), syscall1);
        println!("{}", res);
        assert!(res, "Test 1 Failed");

        // Test 2: ALLOW for non-matching regex
        let syscall2 = "open('bar.txt', 'rb')";
        assert!(!satisfies_rule(&String::from(r"foo\.txt"), syscall2), "Test 2 Failed");

        // Test 3:

        let syscall3 = "openat('example3.txt', 'rb')";
        assert!(satisfies_rule(&String::from("example.*txt"),syscall3), "Test 3 Failed");


        println!("All tests passed!");
    }

    fn prepopulate_ruleset() -> JsonConfigType{
        

        let mut open_rules: HashMap<String, String> = HashMap::new();
        open_rules.insert(String::from(r"/passwd"), String::from("not_allow"));  // Block access to /passwd
        open_rules.insert(String::from(r"'./.*'"), String::from("allow"));       // Allow access to anything in the current directory

        let mut general_rules: HashMap<String, String> = HashMap::new();
        general_rules.insert(String::from(r".*google\.com.*"), String::from("not_allow"));  // Block anything involving google.com
        general_rules.insert(String::from(r"."), String::from("not_allow"));

        let mut write_rules: HashMap<String, String> = HashMap::new();
        write_rules.insert(String::from(r".*"), String::from("not_allow"));               // Disable all writing permissions
        write_rules.insert(String::from(r"'koko.txt',.*"), String::from("allow"));        // Allow writing only to koko.txt


        let mut openat_rules: HashMap<String, String> = HashMap::new();
        openat_rules.insert(String::from("example.*txt"), String::from("not_allow"));

        let mut all_other_fields: HashMap<String,SyscallRuleSet> = HashMap::new();

        all_other_fields.insert(String::from("open"), open_rules);
        all_other_fields.insert(String::from("write"), write_rules);
        all_other_fields.insert(String::from("openat"),openat_rules);

        let ruleset: JsonConfigType = JsonConfigType{
            general_rules,
            additional_fields: all_other_fields 
            
        };

        println!("hi");
        println!("{}",json!(ruleset).to_string());

        ruleset
}


    #[test]
    fn test_is_syscall_permittedd() {
        
//         ``` here is how the ruleset looks like 
//             ruleset = {
//     "rules": {
//         "open": {
//             r"/passwd": "not_allow",   # Block access to /passwd, no quotes are needed
//             r"'./.*'": "allow"         # Allow access to anything in the current directory
//         },
//         "general_rules": {
//             r".*google\.com.*": "not_allow"  # Block anything that involves google.com
//         },
//         "write": {
//             r".*": "not_allow",               # Disable all writing permissions
//             r"'koko.txt",.*": "allow"         # Allow writing only to koko.txt
//         }
//     }
// }

        
//         ```
        
        
        // Test ruleset as per the new config
        let ruleset = prepopulate_ruleset();

        // Test 1: Allowed open syscall in the current directory
        let syscall1 = "open('./test.txt','idinahui')";
        let result1 = is_syscall_permittedd(syscall1, &ruleset);
        assert_eq!(result1.get("shouldRun").unwrap(), &true, "Test 1 Failed");

        println!("gi");

        // Test 2: Blocked open syscall to /passwd
        let syscall2 = "open('/passwd')";
        let result2 = is_syscall_permittedd(syscall2, &ruleset);
        assert_eq!(result2.get("shouldRun").unwrap(), &false, "Test 2 Failed");

        // Test 3: Blocked syscall involving google.com
        let syscall3 = "curl('google.com')";
        let result3 = is_syscall_permittedd(syscall3, &ruleset);
        assert_eq!(result3.get("shouldRun").unwrap(), &false, "Test 3 Failed");

        // Test 4: Blocked write syscall to any file except koko.txt
        let syscall4 = "write('foo.txt', 'data')";
        let result4 = is_syscall_permittedd(syscall4, &ruleset);
        assert_eq!(result4.get("shouldRun").unwrap(), &false, "Test 4 Failed");

        let syscall5 = "openat('example3.txt', 'rb')";
        let result5 = is_syscall_permittedd(syscall5, &ruleset);
        assert_eq!(result5.get("shouldRun").unwrap(), &false, "Test 5 Failed");



        println!("All tests passed!");
    }
}
