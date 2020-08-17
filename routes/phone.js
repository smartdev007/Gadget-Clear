const express = require('express');
const router = express.Router();
const fetchDetails = require('../data/fetchDetails');
const xss=require('xss');
const mongoCollections = require('../config/mongoCollections');
const phones = mongoCollections.mobiles;
const { ObjectId } = require('mongodb')
const comments = require('../data/comments');
//ObjectId = require('mongodb').ObjectID;


router.get('/search', async (req, res) => {
    if(!xss(req.session.flag)){
		res.render("phone/login",{title:"User login",heading:"User login"});
    }
    else
    {
        res.render('phone/homepage',{session: true , title:"Search"});
    }
});

router.get('/home', async (req, res) => {
    res.redirect('/search')
});

router.post('/submit', async (req, res) => {
    const brand = xss(req.body.brand);
    const display = xss(req.body.display);
    const processor = xss(req.body.processor);
    const storage = xss(req.body.storage);

    const getDevice = await fetchDetails.getDevice(brand, display, processor, storage)

    req.session.phonelistFlag=1;

    res.render('phone/phonelist', {
       brand: getDevice,
       session: true,
       title:"List"
    });
});

router.get('/getMobileById', async (req, res) => {
    if(!xss(req.session.flag)){
		res.render("phone/login",{title:"User login",heading:"User login"});
	}
    else{
        const getDeviceById = await fetchDetails.getDeviceById(xss(req.query.dev_id));
        req.session.deviceToRate=xss(req.query.dev_id);

        let the_comments = await comments.getcommentByDevice(getDeviceById);
        let queryFixedDN=getDeviceById.device;
        queryFixedDN = queryFixedDN.replace(/ /g, "+");

        res.render('phone/phonedetails', {
            brand: getDeviceById,
            username: the_comments.author,
            posts: the_comments,
            rating: getDeviceById.overallRating,
            session:true,
            title:"List",
            deviceName:queryFixedDN
        });
    }
})

router.post('/getMobileById/comment', async (req, res) => {
    //console.log("==================");
    const getDeviceById = await fetchDetails.getDeviceById(xss(req.session.deviceToRate));
    let postContent = xss(req.body.postContent);
    const userinfo = xss(req.session.user);
    let author = "";
    if(userinfo != undefined && userinfo != null){
        author = userinfo.username;
    }else{
        author = "anonymous";
    }
    
    try{
		let add_comment = await comments.createcomments(getDeviceById,author,postContent);
		res.status(200).end();
	}catch(e){
		console.log("There was an error! " + e);
		res.status(400).end();
	}
})

router.post("/getMobileById/removeComment", async (req, res) => {
    let comment = xss(req.body.postId);
    if(typeof comment == "string"){
        let id = ObjectId(comment);
    }

	try{
		let remove_comment = await comments.deletecomment(id);
		res.status(200).end();
	}catch(e){
		console.log("There was an error! " + e);
		res.status(400).end();
	}

});


router.get('/compare', async (req, res) => {
    res.render('phone/comparedevice',{session:true})
})

router.post('/compare', async (req, res) => {
    const deviceOne = req.body.deviceOne;
    const deviceTwo = req.body.deviceTwo;
    let error = false

    const compareresult = await fetchDetails.getCompareDevice(deviceOne, deviceTwo);

    compareresult.forEach(device => {
        //console.log(device)
        if (device === null || device === undefined)
            error = true;
    })
    let deviceOnename=deviceOne;
    deviceOnename = deviceOnename.replace(/ /g, "+");
    let deviceTwoname=deviceTwo;
    deviceTwoname = deviceTwoname.replace(/ /g, "+");
    if(!xss(req.session.flag)){
		res.render("phone/login",{title:"User login",heading:"User login"});
    }
    else {
        res.render('phone/compareresult', {
            devicelist: compareresult,
            checkerror: error,
            title:"Compared Devices",
            session:true
            
        });
    }
})



router.post("/starCalc", async (req, res) => {
    //console.log(req.session.deviceToRate);
    const score=xss(req.body.value);
    deviceId=ObjectId(xss(req.session.deviceToRate));
    //console.log(req.session.user._id);
    const mobileCollection= await phones();
    const userid=xss(req.session.user._id);
    const usersRating={
        userid,
        score   
    }
    
    const getDevice = await fetchDetails.getDeviceById(req.session.deviceToRate);
    let flag=1; //checks if inserted in for loop

    for(let i=0;i<await getDevice.UserRating.length;i++){
        if(await getDevice.UserRating[i].userid===userid){
                //console.log("here");
            
            flag=0;
            await mobileCollection.updateOne( {_id : deviceId , "UserRating.score" : await getDevice.UserRating[i].score } , {$set : {"UserRating.$.score" : score} } , false , true);
        }
    }
    
    if(flag===1){
        await mobileCollection.updateOne({_id:deviceId }, {$addToSet: {UserRating:usersRating}});
    }
    
    const check=getDevice.UserRating;
    //console.log(check);

    //update overall rating
    let finalRating=parseFloat(0);

    for(let j=0;j<await getDevice.UserRating.length;j++){
     
       // console.log("score"+getDevice.UserRating[j].score);
       finalRating=finalRating+await getDevice.UserRating[j].score;
    }

    let ratingLength=await getDevice.UserRating.length;

    if(ratingLength===0){
        finalRating=finalRating/1;
    }
    else{
        finalRating=finalRating/ratingLength;
    }
    
    await mobileCollection.updateOne({_id:deviceId }, {$set: {overallRating:finalRating}});
});



module.exports = router;
