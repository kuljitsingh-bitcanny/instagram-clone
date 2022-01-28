import { generateKeywords } from "../constants/constants";


export default function createUser(userId,password,fullname,username,email,phone,imgUrl,birthday,provider){
    const user={
        userId,
        password,
        username:username.toLowerCase(),
        fullname,
        email,
        phone,
        following:[],
        followers:[],
        dateCreated:new Date().valueOf(),
        birthday,
        imgUrl,
        followingCount:0,
        followersCount:0,
        provider,
        keywords:generateKeywords(username.toLowerCase()),
    }
    return user;
}
export function createExistingUser(userId,userDetails,password){
    const user={...userDetails,userId,password};
    return user;
}