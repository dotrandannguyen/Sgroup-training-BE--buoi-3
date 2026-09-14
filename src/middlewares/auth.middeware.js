import jwt from "jsonwebtoken";
import {UnauthorizedError} from "../utils/error.helper.js";
export const authMiddleware = (req, res, next) => {
  //  buoc 1: lay authorization header tu request
  const authourizationHeader = req.headers.authorization;

  //buoc 2 check xem header co dang bearer token hay khong
  if (!authourizationHeader || !authourizationHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
      }
     //  buoc 3: tach access token tu header
    const accessToken = authourizationHeader.split(" ")[1];

    try{
        // buoc 4: verify access token
        const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        //buoc 5 : gan payload vao request de truyen xuong controller
        req.user = payload;
        next();
    }
    catch (error){
        throw new UnauthorizedError("Invalid or expired access token");


    }
 }
