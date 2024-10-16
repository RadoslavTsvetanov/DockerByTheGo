use std::fs::File;
use std::io::Read;
use serde::de::DeserializeOwned;

pub fn load_json<T: DeserializeOwned>(file_path: &str) -> Result<T, Box<dyn std::error::Error>> {
    let mut file = match File::open(file_path) {
        Ok(file) => file,
        Err(e) => return Err(Box::new(e)),
    };

    let mut contents = String::new();
    if let Err(e) = file.read_to_string(&mut contents) {
        return Err(Box::new(e));
    }

    match serde_json::from_str(&contents) {
        Ok(data) => Ok(data),
        Err(e) => Err(Box::new(e)),
    }
}
