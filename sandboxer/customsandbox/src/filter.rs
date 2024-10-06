use regex::Regex;
use std::collections::HashMap;


#[derive(Debug, PartialEq)]
pub enum RuleType {
    REGEX,
    CUSTOM,
}

#[derive(Debug, PartialEq)]
pub enum ModificatorType {
    Allow,
    NotAllow,
}

pub struct Rule {
    pub content: String,
    pub modificator: ModificatorType,
}

fn to_bool(val: Option<regex::Match>) -> bool {
    val.is_some()
}

pub fn satisfies_rule(rule_content: &str, syscall: &str) -> bool {
    let re = Regex::new(r"\((.*?)\)").unwrap();
    
    let content_inside_parens = re.captures(syscall);
    
    if content_inside_parens.is_none() {
        panic!("no content inside parentheses");
    }

    let content_of_syscall = content_inside_parens.unwrap().get(1).unwrap().as_str();
    let rule_re = Regex::new(rule_content).unwrap();
    to_bool(rule_re.find(content_of_syscall))
}

pub fn check_if_syscall_is_permitted(syscall: &str, ruleset: &HashMap<String, HashMap<String, String>>) -> HashMap<String, bool> {
    let syscall_name = syscall.split('(').next().unwrap();
    println!("Checking syscall: {}", syscall_name);

    let mut return_object = HashMap::new();
    return_object.insert(String::from("shouldRun"), true);

    if let Some(general_rules) = ruleset.get("run_on_all_syscalls_regrdless_of_type") {
        for (rule_content, modificator_str) in general_rules {
            let modificator = match modificator_str.as_str() {
                "allow" => ModificatorType::Allow,
                "not_allow" => ModificatorType::NotAllow,
                _ => panic!("Invalid modificator"),
            };

            if modificator == ModificatorType::Allow && satisfies_rule(rule_content, syscall) {
                return_object.insert(String::from("shouldRun"), true);
                println!("Entering allow");
            } else if modificator == ModificatorType::NotAllow && satisfies_rule(rule_content, syscall) {
                return_object.insert(String::from("shouldRun"), false);
                println!("Entering not");
                println!("Args: {}, {}", rule_content, syscall);
            }
        }
    }

    println!("{}: {:?}", syscall, return_object.get("shouldRun").unwrap());

    if let Some(syscall_rules) = ruleset.get(syscall_name) {
        for (rule_content, modificator_str) in syscall_rules {
            let modificator = match modificator_str.as_str() {
                "allow" => ModificatorType::Allow,
                "not_allow" => ModificatorType::NotAllow,
                _ => panic!("Invalid modificator"),
            };

            if modificator == ModificatorType::Allow && satisfies_rule(rule_content, syscall) {
                return_object.insert(String::from("shouldRun"), true);
            } else if modificator == ModificatorType::NotAllow && satisfies_rule(rule_content, syscall) {
                return_object.insert(String::from("shouldRun"), false);
            }
        }
    }

    println!("End of check -----");
    return_object
}
