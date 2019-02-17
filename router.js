const express = require('express')

const router=express.Router()

const gravatar=require('gravatar')

const jwt=require('jsonwebtoken')

const passport=require('passport')

const User=require('./models/User.js')

const Profile=require('./models/Profile.js')

const md5=require('blueimp-md5')

router.get('/test',(req,res)=>{
  res.json({"msg":"profiles works"})
})

router.post('/register', (req, res) => {
  // 查询数据库中是否拥有邮箱
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json('邮箱已被注册!');
    } else {
      const avatar=gravatar.url(req.body.email,
        {
            s:'200',
            r:'pg',
            d:'mm'
        }
      )  
      req.body.password=md5(md5(req.body.password))
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
        identity:req.body.identity
      })
      
      newUser.save().then(user=>res.json(user)).catch(err=>{console.log(err)})
    }
  });
});

router.post('/login',(req,res)=>{
  const email=req.body.email;
  const password=md5(md5(req.body.password));
  User.findOne({email}).then(user=>{
    if(!user){
        return res.status(404).json('用户不存在')
    }
    if(password!=user.password){
        return res.status(400).json('密码错误')
    }else{
        const rule={id:user.id,name:user.name,avatar:user.avatar,identity:user.identity}
        jwt.sign(rule,"secret",{expiresIn:3600},(err,token)=>{
            if(err){
                throw err
            }
            res.json({
                success:true,
                token:"Bearer "+token
            })
        })
    }
  })
})

router.get('/current',passport.authenticate('jwt',{session:false}),(req,res)=>{
    res.json({
        id:req.user.id,
        name:req.user.name,
        email:req.user.email,
        identity:req.user.identity
    })
})

router.post('/add',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const profileFields = {};
    if (req.body.type) profileFields.type = req.body.type;
    if (req.body.describe) profileFields.describe = req.body.describe;
    if (req.body.income) profileFields.income = req.body.income;
    if (req.body.expend) profileFields.expend = req.body.expend;
    if (req.body.cash) profileFields.cash = req.body.cash;
    if (req.body.remark) profileFields.remark = req.body.remark;

    new Profile(profileFields).save().then(profile => {
      res.json(profile);
    });
})

router.get('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
  Profile.find().then(profile=>{
    if(!profile){
      return res.status(400).json('没任何内容')
    }
    res.json(profile)
  })
  .catch(err=>{
     return res.status(404).json(err)
  })
})

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ _id: req.params.id })
      .then(profile => {
        if (!profile) {
          return res.status(404).json('没有任何内容');
        }

        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

router.post('/edit/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const profileFields = {};
    if (req.body.type) profileFields.type = req.body.type;
    if (req.body.describe) profileFields.describe = req.body.describe;
    if (req.body.income) profileFields.income = req.body.income;
    if (req.body.expend) profileFields.expend = req.body.expend;
    if (req.body.cash) profileFields.cash = req.body.cash;
    if (req.body.remark) profileFields.remark = req.body.remark;

    Profile.findOneAndUpdate(
          {_id:req.params.id},
          {$set:profileFields},
          {new:true}
        ).then(profile=>res.json(profile))
})

router.delete('/delete/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOneAndRemove({_id:req.params.id}).then(profile=>{
        profile.save().then(profile=>res.json(profile))
    })
    .catch(err => res.status(404).json('删除失败'));
})

module.exports = router