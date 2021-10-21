import {Request, Response, NextFunction} from 'express';
import {staySchema,Stay} from '../models/staySchema'
class Validator {
  error: string;
  value: string;
 
  constructor(error: string,value: string=' ') {
    this.error = error;
    this.value = value;
  }

}

let stayValidation:any = {};
let formStatus:string;
let isValidated:boolean = true;
const clearInfo = () =>{
  for (var member in stayValidation) delete stayValidation[member];
  formStatus = ''
}

const checkStayValidity = (req:Request,res:Response,next:NextFunction)=>{   
  clearInfo();
  const stay = new Stay(req.body);
  stay.host = req.user?._id;
  let {id} = req.params;
  let schema_error  = stay.validateSync();
  let requiredPaths = staySchema.requiredPaths();
  if(schema_error || !req.isAuthenticated()){
    formStatus = 'form-validated';
    requiredPaths.forEach((path:string)=>{
      let key  = path;
      stayValidation[key]= new Validator(schema_error?.errors[`${path}`]?.message!,stay.get(path))
    })      
   if(stayValidation['description'].value.length<10) stayValidation['description'].value = "";
   for(let data in req.body) {
     if(!stayValidation[data].error) stayValidation[data].error = staySchema.obj[data].validate.message();
    }
    isValidated = false;
    if(req.method === 'PUT') return res.redirect(`/stays/${id}/update`)
    res.redirect(`/stays/new`);
  } else {
    isValidated = true;
    res.locals.stay = stay;
    next();
  }
}

const validationResult = (req:Request,res:Response,next:NextFunction)=>{
  if(!isValidated) {
    res.locals.formStatus = formStatus;
    res.locals.stayValidation = stayValidation;
  }else {
    res.locals.formStatus = '';
    res.locals.stayValidation = {};
  }   
  next();
}

module.exports = {checkStayValidity,validationResult}