use regex::Regex;
use std::collections::HashMap;
use crate::types::JsonConfigType;


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
        println!("no content inside parentheses, {}, debug later why it shows", syscall);
    }

    let content_of_syscall = content_inside_parens.unwrap().get(1).unwrap().as_str();
    let rule_re = Regex::new(rule_content).unwrap();
    to_bool(rule_re.find(content_of_syscall))

}


pub fn is_syscall_permittedd(syscall: &str, ruleset: &JsonConfigType) -> HashMap<String, bool> {


    let syscall_name = syscall.split('(').next().unwrap();
    println!("Checking syscall: {}", syscall_name);


    let mut return_object = HashMap::new();
    return_object.insert(String::from("shouldRun"), true);


    for (rule_content,modificator_str ) in ruleset.general_rules.clone() {
        let modificator = match modificator_str.as_str()  {
            "allow" => ModificatorType::Allow,
            "not_allow" => ModificatorType::NotAllow,
            _ => panic!("Invalid modificator"),
        };

        if modificator == ModificatorType::Allow && satisfies_rule(rule_content.as_str(), syscall) {
            println!("Entering allow");
            return_object.insert(String::from("shouldRun"), true);

        }else if modificator == ModificatorType::NotAllow && satisfies_rule(&rule_content.as_str(), syscall) {
            println!("Entering not");
            println!("Args: {}, {}", rule_content, syscall);
            return_object.insert(String::from("shouldRun"), false);
        }
    }


    println!("{}: {:?}", syscall, return_object.get("shouldRun").unwrap());


    match  ruleset.additional_fields.get(syscall_name) {
        Some(rules) => {
            for (rule_content, modificator_str) in rules {
                let modificator = match modificator_str.as_str() {
                    "allow" => ModificatorType::Allow,
                    "not_allow" => ModificatorType::NotAllow,
                };

                if modificator == ModificatorType::Allow && satisfies_rule(rule_content, syscall) {
                    return_object.insert(String::from("shouldRun"), true);
                } else if modificator == ModificatorType::NotAllow && satisfies_rule(rule_content, syscall) {
                    return_object.insert(String::from("shouldRun"), false);
                }
            }
        }
        None => {
            panic!("no rule detceted")
        }  // No additional rules found for this syscall
    }
    println!("End of check -----");
    return_object



}
