import {Request, Response, NextFunction} from 'express';
import { ReviewModel,reviewSchema } from '../models/reviewSchema';

let reviewErrors: string[]  = []; 

const validateReview = (req:Request,res:Response,next:NextFunction) =>{
    reviewErrors.length = 0;
    const {id} = req.params;  
    const review = new ReviewModel(req.body);    
    review.user = req.user?._id;  
    let review_error = review.validateSync();
    let requiredPaths = reviewSchema.requiredPaths();
    if(review_error) {
        requiredPaths.forEach((path:string)=>{
            reviewErrors.push(review.validateSync()?.errors[`${path}`]?.message!)
        })
        res.redirect(`/stays/${id}`)
    } else {
        res.locals.review = review
        next();
    }
}

module.exports = {validateReview,reviewErrors}