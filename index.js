import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;
const db = new pg.Client({
    user: 'postgres',
    database: 'book_library',
    password: '12@Arpush',
    port: 5433,
    host: 'localhost'
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
db.connect();

let book = [];


async function imagefrompg(){
    const data = await db.query("SELECT * FROM book_collection");
    book = data.rows;
}

app.get("/" , async (req, res) => {
    await imagefrompg();
    // console.log(book);
    res.render("index.ejs", { book });
});

app.get("/fetchdata/:id", async (req, res) => {
    const id = req.params.id;
    const data = await db.query("SELECT * FROM book_collection WHERE id = $1", [id]);
    const book = data.rows[0];
    console.log(book);
    res.render("new_page.ejs", {book});
})


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});