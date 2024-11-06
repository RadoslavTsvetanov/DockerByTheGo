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

fn to_bool(val: Option<regex::Match>) -> bool {
    val.is_some()
}


fn idk_what_to_do_with_syscall_without_params_so_for_now_it_will_be_abstracted_behind_this_func() -> bool{

    return false;
}

/*
here is an example of how the function works
satisfies_rule("example.*txt","openat('example.txt',"ft")")
we get the content inside the params -> 'example.txt','ft'
and we check it against the regex for any matches and if it finds the string it returns true
 */
pub fn satisfies_rule(rule_content: &str, syscall: &str) -> bool {

    let re = Regex::new(r"\((.*?)\)").unwrap();

    let content_inside_parens = re.captures(syscall);

    if content_inside_parens.is_none() {
        return idk_what_to_do_with_syscall_without_params_so_for_now_it_will_be_abstracted_behind_this_func();
    }

    let content_of_syscall = content_inside_parens.unwrap().get(1).unwrap().as_str();
    let rule_re = Regex::new(rule_content).unwrap();
    to_bool(rule_re.find(content_of_syscall))

}


pub fn is_syscall_permittedd(syscall: &str, ruleset: &JsonConfigType) -> bool {


    let syscall_name = syscall.split('(').next().unwrap();


    let mut should_run = true;
    if syscall.contains("=n") {
        println!("just for debugging");
    }

    for (rule_content,modificator_str ) in ruleset.general_rules.clone() {
        let modificator = match modificator_str.as_str()  {
            "allow" => ModificatorType::Allow,
            "not_allow" => ModificatorType::NotAllow,
            _ => panic!("Invalid modificator"),
        };

        let is_rule_satisfied = satisfies_rule(rule_content.as_str(), syscall);

        if modificator == ModificatorType::Allow && is_rule_satisfied {
            should_run = true;

        }else if modificator == ModificatorType::NotAllow && is_rule_satisfied {
            should_run = false;
        }

    }


    match  ruleset.additional_fields.get(syscall_name) {
        Some(rulesSet) => {
            for (rule_content, modificator_str) in rulesSet {
                let modificator = match modificator_str.as_str() {
                    "allow" => ModificatorType::Allow,
                    "not_allow" => ModificatorType::NotAllow,
                    _ => panic!("Invalid modificator"),
                };

                if modificator == ModificatorType::Allow && satisfies_rule(rule_content, syscall) {
                    should_run = true;
                } else if modificator == ModificatorType::NotAllow && satisfies_rule(rule_content, syscall) {
                    should_run = false;
                }
            }
        }
        None => {} // TODO: decide what to do if no rule is found
    }


    should_run


}
