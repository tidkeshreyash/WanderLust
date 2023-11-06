const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); 

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// app.use(express.static(path.join(__dirname, "public")));

main().then( ()=>{
    console.log("connected to DB");
})
.catch((err) =>{
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL);
}




app.get("/", (req,res) =>{
    res.send("hi, I am root");
});

app.get("/listings", async (req,res) =>{
    const allListings = await Listing.find( {} );
    res.render("index.ejs", {allListings});
});

app.get("/listings/new", (req,res) => {
    res.render("new.ejs");
});



app.get("/listings/:id", async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("show.ejs", {listing});
});

app.post("/listings",async (req,res,next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
});

app.get("/listings/:id/edit", async  (req,res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("edit.ejs", {listing});
});


app.put("/listings/:id", async (req,res) =>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
});

app.delete("/listings/:id", async (req,res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");

});


// app.get("/testListing", async (req,res) =>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 12000,
//         location: "Amravati",
//         country: "India",
//     });

//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("succesful testing");
// });



app.listen(8080, () => {
    console.log("server is listening to port 8080");
});