
function getDBEnv(): {user: string, password: string, host: string, port: number, database: string} { 
    return {
        user: "fooo",
        password: "bar",
        host: "localhost",
        port: 5432,
        database: "mydb"
    }
}

function getS3Env():{Bucket: string, Key: string, Body: string} {
    return {
        Bucket: "my-bucket",
        Key: "my-key",
        Body: "Hello, World!"  
    } 
}

exports.handler = async (event) => {
    
    
    function getEnv() {
        return {
            db: getDBEnv(),
            s3: getS3Env()
        }
    }
    
    
    return {
        statusCode: 200,
        body: getEnv() 
    };
};
