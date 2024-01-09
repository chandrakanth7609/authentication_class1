const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const bcrypt = require("bcrypt")

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

// Get Users API
app.get("/users/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    user;`;
  const userArray = await db.all(getBooksQuery);
  response.send(userArray);
});

// creating new book API
app.post("/books/" ,async(request ,response) =>{
    const { title ,authorId , rating ,ratingCount } = request.body;
    const addBookQuery =`
    INSERT INTO book(title , author_id , rating ,rating_count)
    VALUES('${title}','${authorId}','${rating}','${ratingCount}') ;`;
    await db.run(addBookQuery);
    response.send("new book added");
});

// creating new user API
app.post("/users/" ,async(request ,response) =>{
    const { username ,name , password ,gender , location } = request.body;
    const hashPassword =await bcrypt.hash(password ,10);
    const selectUserQuery = `
    SELECT  * 
    FROM user 
    WHERE username = '${username}';`;
    const dbUser = await db.get(selectUserQuery);

    if (dbUser === undefined){
        const addUserQuery =`
        INSERT INTO user(username , name , password ,gender , location)
        VALUES('${username}','${name}','${hashPassword}','${gender}' ,'${location}') ;`;
        await db.run(addUserQuery);
        response.send("new user added");            
    }else{
        response.status(400);
        response.send("User name already exists");
    }
    
});

// login credintials  API
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.send("Login Success!");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});


