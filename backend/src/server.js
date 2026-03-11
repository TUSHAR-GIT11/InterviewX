import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import resolvers from "./graphql/resolvers.js";
import typeDefs from "./graphql/typeDefs.js";

dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context:async({req})=>{
     const authHeader = req.headers.authorization || ""
     if(!authHeader) return {}
     try{
           const token = authHeader.replace("Bearer ","")
           const decoded = jwt.verify(token, process.env.JWT_SECRET)
           return {user: decoded}

     }catch(err){
          return {}
     }     
  }
});

console.log(`🚀 Server ready at ${url}`);