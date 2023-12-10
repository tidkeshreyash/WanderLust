const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); 
const {reviewSchema} = require("./Schema.js");
const Review = require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");

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


//show route
app.get("/listings/:id", async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
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


const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//Reviews
//post route
app.post("/listings/:id/reviews", validateReview, async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await  newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);  
});

 //delete review route
 app.delete("/listings/:id/reviews/:reviewId", async (req,res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);



    res.redirect(`/listings/${id}`);
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
