use std::collections::HashMap;
use serde::{Deserialize, Serialize};

pub type SyscallRuleSet = HashMap<String, String>;


#[derive(Serialize, Deserialize, Debug)]
pub struct JsonConfigType {
    pub general_rules: SyscallRuleSet,

    #[serde(flatten)] // This will capture any unknown fields into a HashMap
    pub additional_fields: HashMap<String,SyscallRuleSet>,
}
