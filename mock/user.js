
const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://static-btri.midea.com/mfs/1001/1655968693532.png',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://static-btri.midea.com/mfs/1001/1655968693532.png',
    name: 'Normal Editor'
  }
}

module.exports = [
  // user register
  {
    url: '/vue-admin-template/user/register',
    type: 'post',
    response: config => {
      const { username, password } = config.body
      const userName = username && username.trim()

      if (!userName || !password) {
        return {
          code: 40000,
          message: '用户名和密码不能为空'
        }
      }

      if (tokens[userName]) {
        return {
          code: 40001,
          message: '用户名已存在'
        }
      }

      const token = `${userName}-token`
      tokens[userName] = { token }
      users[token] = {
        roles: ['editor'],
        introduction: `I am ${userName}`,
        avatar: 'https://static-btri.midea.com/mfs/1001/1655968693532.png',
        name: userName
      }

      return {
        code: 20000,
        data: {
          username: userName
        },
        message: '注册成功'
      }
    }
  },

  // user login
  {
    url: '/vue-admin-template/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 20000,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/vue-admin-template/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/vue-admin-template/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
