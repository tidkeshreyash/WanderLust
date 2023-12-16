const express = require("express");
const router = express.Router();
const {reviewSchema} = require("../Schema.js");
const Listing = require("../models/listing.js");


//Index Route
router.get("/", async (req,res) =>{
    const allListings = await Listing.find( {} );
    res.render("index.ejs", {allListings});
});


//New Route
router.get("/new", (req,res) => {
    res.render("new.ejs");
});


//show route
router.get("/:id", async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("show.ejs", {listing});
});


//create route
router.post("/",async (req,res,next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});


//edit route
router.get("/:id/edit", async  (req,res) =>{
let { id } = req.params;
const listing = await Listing.findById(id);
res.render("edit.ejs", {listing});
});


//update route
router.put("/:id", async (req,res) =>{
let { id } = req.params;
await Listing.findByIdAndUpdate(id, {...req.body.listing});
res.redirect(`/listings/${id}`);
});


//delete route
router.delete("/:id", async (req,res) =>{
let { id } = req.params;
let deletedListing = await Listing.findByIdAndDelete(id);
console.log(deletedListing);
res.redirect("/listings");

});

module.exports = router;