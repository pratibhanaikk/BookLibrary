import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import bcrypt from 'bcrypt';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';
import GoogleStrategy from 'passport-google-oauth2';
import env from 'dotenv';

const app = express();
const port = 4000;
const db = new pg.Client({
    user: 'postgres',
    database: 'book_library',
    password: '12@Arpush',
    port: 5433,
    host: 'localhost'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
db.connect();
app.use(session({
    secret: "SECRETFORBOOKS",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
passport.use("local", new Strategy({ usernameField: "username", passwordField: "password" },
    async function (username, password, cd) {
        try {
            const user_books = await db.query("SELECT * FROM users WHERE email = $1", [username]);
            if (user_books.rows.length == 0) return cd(null, false);
            const user = user_books.rows[0];
            if (password == user.password) {
                return cd(null, user);
            }
            else {
                return cd(null, false);
            }
        } catch (err) {
            return cd(err);
        }
    }
));

passport.serializeUser((user, cd) => {
    cd(null, user.id);
});

passport.deserializeUser(async (id, cd) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
        if (result.rows.length > 0){
            cd(null, result.rows[0]);
        }else{
        cd(null, false);
        }
    } catch (error) {
        cd(error);
    }
});

let book = [];


async function imagefrompg() {
    const data = await db.query("SELECT * FROM book_collection");
    book = data.rows;
}

app.get("/", async (req, res) => {
    await imagefrompg();
    // console.log(book);
    res.render("loginpage");
});

app.post("/login", passport.authenticate('local', {
    successRedirect: "/bookscollection",
    failureRedirect: "/",
}));

app.get("/bookscollection", async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/");
    try {
        const book = await db.query("SELECT * FROM books_read WHERE user_email = $1", [req.user.email]);
        console.log(book.rows);
        res.render("index", { book: book.rows });
    } catch (error) {
        if (!res.headersSent) res.redirect("/");
    }
});

app.get("/fetchdata/:id", async (req, res) => {
    const id = req.params.id;
    const data = await db.query("SELECT * FROM book_collection WHERE id = $1", [id]);
    const book = data.rows[0];
    console.log(book);
    res.render("new_page", { book });
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});