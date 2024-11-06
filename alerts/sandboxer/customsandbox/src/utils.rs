use std::collections::HashMap;
use serde_json::json;
use crate::types::{JsonConfigType, SyscallRuleSet};

pub fn prepopulate_ruleset() -> JsonConfigType{


    let mut general_rules: HashMap<String, String> = HashMap::new();
    general_rules.insert(String::from(r".*google\.com.*"), String::from("not_allow"));  // Block anything involving google.com
    general_rules.insert(String::from("example.*txt"), String::from("not_allow"));

    let mut openat_rules: HashMap<String, String> = HashMap::new();
    openat_rules.insert(String::from("example.*txt"), String::from("not_allow"));

    let mut all_other_fields: HashMap<String,SyscallRuleSet> = HashMap::new();

    all_other_fields.insert(String::from("openat"),openat_rules);

    let ruleset: JsonConfigType = JsonConfigType{
        general_rules,
        additional_fields: all_other_fields
    };

    println!("hi");
    println!("{}",json!(ruleset).to_string());

    ruleset
}
