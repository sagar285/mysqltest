import dbConnection from "../config/dbConnection";
import bcrypt from 'bcrypt';

const createUserTable = async () => {
    const dbName = process.env.NAME;

    dbConnection.query(`USE ${dbName}`, (err) => {
        if (err) {
            console.error(`Error selecting database: ${dbName}`, err);
            return;
        }

        // Once the database is selected, proceed with the table creation
        const checkTableQuery = "SHOW TABLES LIKE 'User'";
        dbConnection.query(checkTableQuery, (err, result) => {
            if (err) throw err;
            if (result.length === 0) {
                const createUserTableQuery = `
                    CREATE TABLE User (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        userId VARCHAR(255),
                        username VARCHAR(50) NOT NULL,
                        email VARCHAR(100) NOT NULL,
                        phone VARCHAR(15),
                        password VARCHAR(255) NOT NULL
                    )
                `;
                dbConnection.query(createUserTableQuery, async (err) => {
                    if (err) throw err;
                    console.log('User table created');

                    // After creating the table, insert the superadmin entry
                    const insertSuperadminQuery = `
                        INSERT INTO User (userId, username, email, password) VALUES (?, ?, ?, ?)
                    `;
                    const superadminPassword = 'labhkari';
                    const hashedPassword = await bcrypt.hash(superadminPassword, 10); // Hash the password before inserting

                    dbConnection.query(insertSuperadminQuery, ['superadmin', 'Super Admin', 'admin@gmail.com', hashedPassword], (err) => {
                        if (err) throw err;
                        console.log('Superadmin user inserted');
                    });
                });
            } else {
                console.log('User table already exists');
            }
        });
    });
};

export { createUserTable };
