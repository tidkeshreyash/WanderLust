const express = require("express");
const router = express.Router();
const Review = require("../models/review.js");
const {reviewSchema} = require("../Schema.js");
const Listing = require("../models/listing.js");



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
router.post("/", validateReview, async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await  newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);  
});



 //delete review route
 router.delete("/:reviewId", async (req,res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);



    res.redirect(`/listings/${id}`);
 });