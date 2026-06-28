<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">

      <div class="title-container">
        <h3 class="title">
          <img src="https://static-btri.midea.com/mfs/1023/1690440473891.svg" />
        </h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="username" v-model="loginForm.username" placeholder="Username" name="username" type="text"
          tabindex="1" auto-complete="on" />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
          placeholder="Password" name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;"
        @click.native.prevent="handleLogin">登录</el-button>

      <el-button type="text" class="register-btn" @click="openRegisterDialog">没有账号？立即注册</el-button>

    </el-form>

    <el-dialog title="用户注册" :visible.sync="registerDialogVisible" width="420px" :close-on-click-modal="false"
      @closed="resetRegisterForm">
      <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" auto-complete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" auto-complete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" auto-complete="off"
            @keyup.enter.native="handleRegister" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="registerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="registerLoading" @click="handleRegister">注册</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { register } from '@/api/user'
import { validUsername } from '@/utils/validate'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'admin',
        password: '111111'
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      registerRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        confirmPassword: [{ required: true, trigger: 'blur', validator: validateConfirmPassword }]
      },
      loading: false,
      registerLoading: false,
      registerDialogVisible: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    openRegisterDialog() {
      this.registerDialogVisible = true
      this.$nextTick(() => {
        this.$refs.registerForm && this.$refs.registerForm.clearValidate()
      })
    },
    resetRegisterForm() {
      this.registerForm = {
        username: '',
        password: '',
        confirmPassword: ''
      }
      this.$nextTick(() => {
        this.$refs.registerForm && this.$refs.registerForm.clearValidate()
      })
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (!valid) {
          return false
        }

        this.registerLoading = true
        const { username, password } = this.registerForm
        register({ username: username.trim(), password }).then(() => {
          this.$message.success('注册成功，请登录')
          this.loginForm.username = username.trim()
          this.loginForm.password = password
          this.registerDialogVisible = false
          this.registerLoading = false
        }).catch(() => {
          this.registerLoading = false
        })
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: #000;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
    background-color: #fff;
    border: 1px solid #8e9ab4;
    border-radius: 4px;
    transition: all .3s;
  }

  .register-form {
    .el-input {
      width: 100%;
      height: auto;

      input {
        height: 40px;
        padding: 0 15px;
        color: #606266;
        border: 1px solid #DCDFE6;
        border-radius: 4px;
        background-color: #fff;
        caret-color: auto;
      }
    }

    .el-form-item {
      border: 0;
      background: transparent;
    }
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background: url(https://static-btri.midea.com/images/apps/sso/login-back.jpg) no-repeat;
  background-size: 100% 100%;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;

  .login-form {
    position: relative;
    width: 380px;
    margin: auto 0;
    margin-right: 110px;
    padding: 30px 40px 48px;
    overflow: hidden;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 6px 12px hsla(0, 0%, 84.7%, .12);

  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .title {
      width: 198px;
      height: 80px;
      padding-top: 10px;
      padding-bottom: 20px;
      font-size: 26px;

      // color: $light_gray;
      // margin: 0px auto 40px auto;
      // text-align: center;
      // font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .register-btn {
    width: 100%;
    margin-left: 0;
    color: #409EFF;
  }
}
</style>
