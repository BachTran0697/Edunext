const express = require('express');
const router = express.Router();
const customerModel = require('../model/customerModel');
const multer = require('multer');

/* GET home page. */
let storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'public/images')
  },
  filename: function(req, file, cb){
    cb(null, `${file.filename}-${Date.now()}.jpg`)
  }
})
const upload = multer({storage:storage});
router.get('/', async function(req, res, next) {
  let customers = await customerModel.find({})
  res.render('customer/index', { customers });
});

router.get('/create', (req,res)=>{
  res.render('customer/create')
})
router.post('/create', upload.single('image'),async (req,res) =>{
  const body = req.body
  let file = req.file
  let cust = new customerModel({
    fullname: body.fullname,
    password: body.password,
    email: body.email,
    image: file.filename
  })
  await cust.save();
  res.redirect('/customer')
})

router.get('/update/:id', async (req,res)=>{
  const customer = await customerModel.findById(req.params.id)
  res.render('customer/update', {customer})
})
router.post('/update/:id', upload.single('image'), async (req, res) => {
  const body = req.body;
  const file = req.file;
  const customerId = req.params.id;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
  if (!passwordRegex.test(body.password)) {
    return res.status(400).send('Invalid password. Password must be at least 8 characters long and include both letters and numbers.');
  }

  const updateData = {
    fullname: body.fullname,
    password: body.password,
    email: body.email
  };

  if (file) {
    updateData.image = file.filename;
  }

  await customerModel.findByIdAndUpdate(customerId, updateData);
  res.redirect('/customer');
});
module.exports = router;