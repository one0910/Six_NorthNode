const { Schema, model } = require('mongoose')

const memberSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      select: false
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    nickName: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin']
    },
    phoneNumber: { type: String },
    birthday: {
      type: Date,
      default: ''
    },
    profilePic: { type: String, default: '' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    googleId: { type: String }
  },
  {
    timestamps: true,
    toJSON: { versionKey: false }
  }
)

const member = model('member', memberSchema)
module.exports = member
