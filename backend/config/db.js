import mysql from 'mysql2/promise';

export const connectDB = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password123',
            database: 'my_database'
        });

        console.log("Database Connected");
        return connection;
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
    }
};
