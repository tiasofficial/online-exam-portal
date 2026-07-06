var mongoose = require('mongoose')

var classSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true,
    unique : true
  },
  students : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'user'
  }],
  subjects : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'subject'
  }],
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'userModel'
  }
},
{
  timestamps : true
})

module.exports = classSchema
