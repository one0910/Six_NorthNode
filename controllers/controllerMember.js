const hash = require('@/utilities/hash')
const modelMember = require('@/models/modelMember')
const serviceResponse = require('@/services/serviceResponse')
const httpCode = require('@/utilities/httpCode')
const convertPlayDateFormat = require('@/utilities/convertPlayDateFormat')
const serviceJWT = require('@/services/serviceJWT')

const controllerMember = {
  // 註冊
  async signup ({ password, email, nickName }) {
    const newPassword = await hash.password(password)
    const data = {
      email,
      password: newPassword,
      nickName
    }
    const checkUser = await modelMember.findOne({ email: data.email })
    if (checkUser !== null) {
      throw serviceResponse.error(httpCode.NOT_ACCEPTABLE, '帳號已被使用')
    }
    const createRes = await modelMember.create(data)
    const signinToken = serviceJWT.generateJWT(createRes)
    const result = { token: signinToken, signinRes: createRes }
    return result
  },

  // 登入
  async signin (email, password) {
    const signinRes = await modelMember.findOne({ email }).select('+password')
    if (signinRes === null) {
      throw serviceResponse.error(httpCode.NOT_FOUND, '此帳號不存在')
    }

    const compare = await hash.compare(password, signinRes.password)

    if (!compare) {
      throw serviceResponse.error(httpCode.NOT_FOUND, '密碼錯誤')
    }

    const signinToken = serviceJWT.generateJWT(signinRes)

    signinRes.password = null

    const authData = {
      token: signinToken,
      signinRes
    }
    return authData
  },
  // 單純修改密碼
  async changePassword (user, password) {
    const newPassword = await hash.password(password)
    const editPassword = await modelMember.findByIdAndUpdate(
      user,
      { password: newPassword },
      {
        returnDocument: 'after',
        runValidators: true
      })
    console.log('editPassword => ', editPassword)
    return editPassword
  },
  // 確認信箱是否重複
  async checkEmail (email) {
    const checkUser = await modelMember.findOne({ email })
    if (checkUser !== null) {
      throw serviceResponse.error(httpCode.NOT_ACCEPTABLE, '該信箱已被註冊')
    }

    const result = {
      message: `${email}`
    }

    return result
  },

  // 管理頁面 - 新增會員
  async createAccount (data) {
    const newPassword = await hash.password(data.password)
    const createData = {
      ...data,
      password: newPassword
    }
    try {
      const createRes = await modelMember.create(createData)
      const { password, ...result } = createRes.toObject()
      return result
    } catch (error) {
      console.log(' error=> ', error.name, error.message)
      throw serviceResponse.error(httpCode.NOT_FOUND, `${error.name} : ${error.message}`)
    }
  },

  // 取得會員資料
  async getUser (user) {
    const UserData = await modelMember.findById({ _id: user })
    return UserData
  },

  // 管理頁面 - 取得使用者相關資料
  async getUserData ({ type, payload }) {
    if (type === 'dataForChart') {
      const selectedFields = 'createdAt'
      try {
        const Users = await modelMember.find().select(selectedFields)
        const monthsTemplate = []
        for (let index = 1; index < 13; index++) {
          if (index >= 10) {
            monthsTemplate.push({
              Month: `${index}`,
              Total: 0
            })
          } else {
            monthsTemplate.push({
              Month: `0${index}`,
              Total: 0
            })
          }
        }
        const newUsers = Users.reduce((acc, currentValue) => {
          const { year, month } = convertPlayDateFormat(currentValue.createdAt)
          if (!acc[year]) {
            // 初始化當年的月份資料 ,因此的深拷貝月份的模板進來 , 下面2種方式都可以
            acc[year] = JSON.parse(JSON.stringify(monthsTemplate))
            // acc[year] = monthsTemplate.map(monthData => ({ ...monthData }));
          }

          const monthIndex = acc[year].findIndex(item => item.Month === month)
          if (monthIndex !== -1) {
            acc[year][monthIndex].Total += 1
          }
          return acc
        }, {})

        return newUsers
      } catch (error) {
        throw serviceResponse.error(httpCode.NOT_FOUND, '查不到使用者資料')
      }
    } else if (type === 'dataForManagement') {
      try {
        const Users = await modelMember.find()
        return Users
      } catch (error) {
        throw serviceResponse.error(httpCode.NOT_FOUND, '查不到使用者資料')
      }
    }
  },

  // 取得目前所有會員數量
  async getUserCount (daterange) {
    let userCount
    switch (daterange) {
      case 'all': userCount = await modelMember.countDocuments({ role: 'user' })
        break
      default: userCount = await modelMember.countDocuments({ role: 'user' })
        break
    }
    return userCount
  },

  // 管理頁面 - 修改會員資料
  async updateUser (id, { email, nickName, phoneNumber, birthday, profilePic, role }) {
    try {
      const result = await modelMember.findByIdAndUpdate(
        id,
        { email, nickName, phoneNumber, birthday, profilePic, role },
        { returnDocument: 'after', runValidators: true, new: true }
      )
      return result
    } catch (error) {
      console.log(' error=> ', error.name, error.message)
      throw serviceResponse.error(httpCode.NOT_FOUND, `${error.name} : ${error.message}`)
    }
  },

  // 管理頁面 - 刪除會員資料
  async deleteUser (id) {
    try {
      await modelMember.findByIdAndDelete(id)
      const allMembers = await modelMember.find()
      return allMembers
    } catch (error) {
      console.log(' error=> ', error.name, error.message)
      throw serviceResponse.error(httpCode.NOT_FOUND, `${error.name} : ${error.message}`)
    }
  },

  async googleLogin (userData) {
    const googleMemberData = await modelMember.findOne({ googleId: userData.id })
    if (googleMemberData) {
      const memberToken = serviceJWT.generateJWT(googleMemberData)
      memberToken.password = null
      return { token: memberToken, signinRes: googleMemberData }
    } else {
      const data = {
        googleId: userData.id,
        email: userData.emails[0].value,
        nickName: userData.displayName,
        profilePic: userData.photos[0].value
      }
      const newMember = await modelMember.create(data)
      const memberToken = serviceJWT.generateJWT(newMember)
      return { token: memberToken, createRes: newMember }
    }
  }
}

module.exports = controllerMember
