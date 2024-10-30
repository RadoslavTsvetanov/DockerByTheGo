// Import necessary libraries
import { Client } from "pg"; // PostgreSQL client
import AWS from "aws-sdk"; // AWS SDK

// Initialize S3 client
const s3 = new AWS.S3();

// PostgreSQL connection details
const dbConfig = {
  user: "foo",
  host: "your-database-endpoint",
  database: "mydb",
  password: "foobarbaz",
  port: 5432,
};

export const getHandler = async (event: object) => {
  const client = new Client(dbConfig);
  await client.connect();

  try {
    const res = await client.query("SELECT * FROM your_table"); 
    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
    };
  } catch (error) {
    console.error("Error querying database:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch data" }),
    };
  } finally {
    await client.end();
  }
};

export const postHandler = async (event: {body: string}) => {
  const client = new Client(dbConfig);
  await client.connect();

  const body = JSON.parse(event.body); 
  const { key, value } = body; 

  try {
    // Insert data into PostgreSQL
    await client.query("INSERT INTO your_table (key, value) VALUES ($1, $2)", [
      key,
      value,
    ]);

    // Optionally, upload to S3
    const params = {
      Bucket: "your-s3-bucket-name",
      Key: `${key}.txt`, // Example key
      Body: value,
    };
    await s3.putObject(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Data inserted successfully" }),
    };
  } catch (error) {
    console.error("Error inserting data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to insert data" }),
    };
  } finally {
    await client.end();
  }
};
