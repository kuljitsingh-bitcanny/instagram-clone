

export default function createUser(userId,password,fullname,username,email,phone,imgUrl,birthday,provider){
    const user={
        userId,
        password,
        username,
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
        provider
    }
    return user;
}
export function createExistingUser(userId,userDetails,password){
    const user={...userDetails,userId,password};
    return user;
}